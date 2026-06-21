const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OCTO = path.join(__dirname, '..', 'bin', 'octo.js');
const TEST_DIR = path.join(__dirname, 'tmp');

let passed = 0;
let failed = 0;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: TEST_DIR });
  } catch (e) {
    return e.stdout || e.stderr || '';
  }
}

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ ${message}`);
  }
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

console.log('Octo-POA Tests\n');

// Test 1: Init
console.log('Test: init');
setup();
run(`node ${OCTO} init`);
assert(fs.existsSync(path.join(TEST_DIR, '.octo')), 'Creates .octo directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/sessions')), 'Creates sessions directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/graph')), 'Creates graph directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/tokens')), 'Creates tokens directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/workflows')), 'Creates workflows directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/plans')), 'Creates plans directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/config.json')), 'Creates config.json');

// Test 2: Plan init
console.log('\nTest: plan init');
run(`node ${OCTO} plan init my-product`);
assert(fs.existsSync(path.join(TEST_DIR, '.octo/plans/my-product')), 'Creates plan directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/plans/my-product/BRIEF.md')), 'Creates BRIEF.md');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/plans/my-product/DESIGN.md')), 'Creates DESIGN.md');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/plans/my-product/TASKS.md')), 'Creates TASKS.md');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/plans/my-product/PROGRESS.json')), 'Creates PROGRESS.json');

// Test 3: Session start
console.log('\nTest: session start');
run(`node ${OCTO} session start test-session`);
assert(fs.existsSync(path.join(TEST_DIR, '.octo/sessions/test-session')), 'Creates session directory');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/sessions/test-session/CONTEXT.md')), 'Creates CONTEXT.md');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/sessions/test-session/DECISIONS.md')), 'Creates DECISIONS.md');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/sessions/test-session/PROGRESS.md')), 'Creates PROGRESS.md');
assert(fs.existsSync(path.join(TEST_DIR, '.octo/sessions/test-session/TOKENS.json')), 'Creates TOKENS.json');

// Test 4: Graph init
console.log('\nTest: graph init');
run(`node ${OCTO} graph init`);
assert(fs.existsSync(path.join(TEST_DIR, '.octo/graph/graph.json')), 'Creates graph.json');

// Test 5: Graph scan
console.log('\nTest: graph scan');
// Create a test file to scan
fs.writeFileSync(path.join(TEST_DIR, 'test.js'), 'function hello() {\n  return "world";\n}');
run(`node ${OCTO} graph scan`);
const graphContent = JSON.parse(fs.readFileSync(path.join(TEST_DIR, '.octo/graph/graph.json'), 'utf-8'));
assert(graphContent.nodes.length > 0, 'Graph has nodes');
assert(graphContent.metadata.lastUpdated, 'Graph has lastUpdated');

// Test 6: Help
console.log('\nTest: help');
const helpOutput = run(`node ${OCTO} help`);
assert(helpOutput.includes('Octo-POA'), 'Shows help message');
assert(helpOutput.includes('plan'), 'Help includes plan command');
assert(helpOutput.includes('session'), 'Help includes session command');
assert(helpOutput.includes('graph'), 'Help includes graph command');

// Test 7: Plan status
console.log('\nTest: plan status');
const planStatus = run(`node ${OCTO} plan status my-product`);
assert(planStatus.includes('my-product'), 'Shows plan name');
assert(planStatus.includes('Progress'), 'Shows progress');

// Test 8: Session list
console.log('\nTest: session list');
run(`node ${OCTO} session start another-session`);
const sessionList = run(`node ${OCTO} session list`);
assert(sessionList.includes('test-session'), 'Lists test-session');
assert(sessionList.includes('another-session'), 'Lists another-session');

// Test 9: Graph stats
console.log('\nTest: graph stats');
const graphStats = run(`node ${OCTO} graph scan`);
assert(graphStats.includes('Scanned'), 'Shows scan results');

// Test 10: Optimize status
console.log('\nTest: optimize status');
const optimizeStatus = run(`node ${OCTO} optimize status`);
assert(optimizeStatus.includes('Token Usage') || optimizeStatus.includes('No token'), 'Shows optimize status');

// Cleanup
cleanup();

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
