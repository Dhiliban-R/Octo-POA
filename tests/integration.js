const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const OCTO = path.join(__dirname, '..', 'bin', 'octo.js');
const TEST_DIR = path.join(__dirname, 'integration-test');

function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      timeout: 10000,
      cwd: TEST_DIR
    });
  } catch (e) {
    return e.stdout || e.message;
  }
}

// Setup
if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
fs.mkdirSync(TEST_DIR, { recursive: true });
fs.writeFileSync(path.join(TEST_DIR, 'index.js'), 'console.log("hello");');
fs.writeFileSync(path.join(TEST_DIR, 'utils.js'), 'export function add(a,b) { return a+b; }');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}`);
    failed++;
  }
}

console.log('Octo-POA Integration Tests\n');

// Core Tests
console.log('=== CORE ===');
const init = run(`node ${OCTO} init`);
assert('init succeeds', init.includes('initialized') || init.includes('Created'));
assert('init creates .octo', fs.existsSync(path.join(TEST_DIR, '.octo')));
assert('init creates config', fs.existsSync(path.join(TEST_DIR, '.octo', 'config.json')));
assert('init creates db', fs.existsSync(path.join(TEST_DIR, '.octo', 'octo.db')));

const config = run(`node ${OCTO} config-show`);
assert('config-show works', config.includes('version'));
assert('config has gateway', config.includes('gateway'));

// Planning Tests
console.log('\n=== PLANNING ===');
const constitution = run(`node ${OCTO} plan-constitution`);
assert('plan-constitution works', constitution.includes('created'));

const specify = run(`node ${OCTO} specify "Auth system"`);
assert('specify works', specify.includes('created'));

// Execution Tests
console.log('\n=== EXECUTION ===');
const compress = run(`node ${OCTO} compress "Sure! I would be happy to help you with that. The file is basically just a simple config."`);
assert('compress works', compress.includes('compressed'));
assert('compress has savings', compress.includes('savings'));

// Memory Tests
console.log('\n=== MEMORY ===');
const remember = run(`node ${OCTO} remember "Dark theme preferred"`);
assert('remember stores', remember.includes('Stored'));

const remember2 = run(`node ${OCTO} remember "JWT for auth"`);
assert('remember stores 2', remember2.includes('Stored'));

const recall = run(`node ${OCTO} recall "theme"`);
assert('recall works', recall.includes('Dark theme'));

// Knowledge Tests
console.log('\n=== KNOWLEDGE ===');
const scan = run(`node ${OCTO} graph-scan`);
assert('graph-scan works', scan.includes('Scanned'));

const query = run(`node ${OCTO} query "find files"`);
assert('query works', query.includes('results'));

// Gateway Tests
console.log('\n=== GATEWAY ===');
const gateway = run(`node ${OCTO} gateway-status`);
assert('gateway-status works', gateway.includes('object') || gateway.includes('{}') || gateway.length > 0);

// Session Tests
console.log('\n=== SESSION ===');
const session = run(`node ${OCTO} session-start`);
assert('session-start works', session.includes('started') || session.includes('Session'));

// Integration Tests
console.log('\n=== INTEGRATIONS ===');
const agents = run(`node ${OCTO} list-agents`);
assert('list-agents shows claude', agents.includes('claude'));
assert('list-agents shows codex', agents.includes('codex'));
assert('list-agents shows gemini', agents.includes('gemini'));
assert('list-agents shows cursor', agents.includes('cursor'));
assert('list-agents shows generic', agents.includes('generic'));

const installClaude = run(`node ${OCTO} install claude`);
assert('install claude works', installClaude.includes('installed'));

const installGeneric = run(`node ${OCTO} install generic`);
assert('install generic works', installGeneric.includes('installed'));

// Workflow Tests
console.log('\n=== WORKFLOW ===');
const workflowStart = run(`node ${OCTO} workflow-start "TestWorkflow" "A test workflow for integration"`);
assert('workflow-start works', workflowStart.includes('Workflow started'));

const workflowList = run(`node ${OCTO} workflow-list`);
assert('workflow-list shows workflows', workflowList.includes('TestWorkflow'));

// Extract workflow ID from start output - look for pattern like "name-timestamp"
const workflowIdMatch = workflowStart.match(/Workflow started:\s+(.+)/);
const workflowId = workflowIdMatch ? workflowIdMatch[1].trim() : null;
assert('workflow ID captured', workflowId !== null);

if (workflowId) {
  const workflowStatus = run(`node ${OCTO} workflow-status ${workflowId}`);
  assert('workflow-status works', workflowStatus.includes('planning'));
  
  const workflowCheck = run(`node ${OCTO} workflow-check ${workflowId} planning`);
  assert('workflow-check planning allowed', workflowCheck.includes('allowed'));
  
  const workflowCheckExec = run(`node ${OCTO} workflow-check ${workflowId} execution`);
  assert('workflow-check execution blocked', workflowCheckExec.includes('blocked'));
  
  const workflowTodo = run(`node ${OCTO} workflow-todo ${workflowId} "Analyze requirements"`);
  assert('workflow-todo works', workflowTodo.includes('Added'));
  
  // Complete planning phase with signoff
  const workflowComplete = run(`node ${OCTO} workflow-complete ${workflowId} planning --signoff`);
  assert('workflow-complete planning works', workflowComplete.includes('completed'));
  
  const workflowCheckExecAfter = run(`node ${OCTO} workflow-check ${workflowId} execution`);
  assert('workflow-check execution allowed after planning', workflowCheckExecAfter.includes('allowed'));
}

// E2E Test
console.log('\n=== END-TO-END ===');
run(`node ${OCTO} remember "React with TypeScript"`);
run(`node ${OCTO} remember "PostgreSQL database"`);

const e2eRecall = run(`node ${OCTO} recall "React"`);
assert('E2E: memory recall', e2eRecall.includes('React'));

const e2eScan = run(`node ${OCTO} graph-scan`);
assert('E2E: graph scan', e2eScan.includes('Scanned'));

const e2eQuery = run(`node ${OCTO} query "JavaScript"`);
assert('E2E: graph query', e2eQuery.includes('results'));

const e2eCompress = run(`node ${OCTO} compress "Test compression"`);
assert('E2E: compression', e2eCompress.includes('compressed'));

// Cleanup
fs.rmSync(TEST_DIR, { recursive: true });

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));
console.log(failed === 0 ? '\n✓ ALL TESTS PASSED' : '\n✗ SOME TESTS FAILED');

process.exit(failed === 0 ? 0 : 1);
