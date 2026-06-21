const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const OCTO = path.join(__dirname, '..', 'bin', 'octo.js');
const TEST_DIR = path.join(__dirname, 'perf-test');

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

function measureTime(fn) {
  const start = process.hrtime.bigint();
  const result = fn();
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1e6;
  return { result, ms };
}

// Setup
if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
fs.mkdirSync(TEST_DIR, { recursive: true });
fs.writeFileSync(path.join(TEST_DIR, 'index.js'), 'console.log("hello");');

let passed = 0;
let failed = 0;
const benchmarks = [];

function bench(name, fn) {
  const { result, ms } = measureTime(fn);
  benchmarks.push({ name, ms, result });
  console.log(`  ${name}: ${ms.toFixed(2)}ms`);
  return result;
}

function assert(name, condition) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}`);
    failed++;
  }
}

console.log('Octo-POA Performance Tests\n');

// Initialize
run(`node ${OCTO} init`);

// Benchmark 1: CLI Startup Time
console.log('=== CLI Startup ===');
bench('Cold start (init)', () => {
  return run(`node ${OCTO} init`);
});

bench('Config show', () => {
  return run(`node ${OCTO} config-show`);
});

// Benchmark 2: Token Compression
console.log('\n=== Token Compression ===');
const longText = `Sure! I would be happy to help you with that. The file is basically just a simple configuration file that contains all the necessary settings for the application to work properly. It includes database connection strings, API keys, and various other configuration options that are required for the system to function correctly.`;

bench('Compress (full)', () => {
  return run(`node ${OCTO} compress "${longText}"`);
});

bench('Compress (lite)', () => {
  return run(`node ${OCTO} compress "${longText}" --level lite`);
});

// Benchmark 3: Memory Operations
console.log('\n=== Memory Operations ===');
bench('Remember (10 observations)', () => {
  for (let i = 0; i < 10; i++) {
    run(`node ${OCTO} remember "Observation ${i}: Test data for performance benchmarking"`);
  }
  return 'done';
});

bench('Recall (single query)', () => {
  return run(`node ${OCTO} recall "Observation"`);
});

bench('Recall (complex query)', () => {
  return run(`node ${OCTO} recall "performance benchmarking test data"`);
});

// Benchmark 4: Knowledge Graph
console.log('\n=== Knowledge Graph ===');
bench('Graph scan', () => {
  return run(`node ${OCTO} graph-scan`);
});

bench('Graph query', () => {
  return run(`node ${OCTO} query "find functions"`);
});

// Benchmark 5: Workflow Operations
console.log('\n=== Workflow Operations ===');
bench('Workflow start', () => {
  return run(`node ${OCTO} workflow-start "PerfTest" "Performance testing workflow"`);
});

const workflowList = run(`node ${OCTO} workflow-list`);
const workflowId = workflowList.match(/PerfTest-[\w]+/)?.[0];

if (workflowId) {
  bench('Workflow status', () => {
    return run(`node ${OCTO} workflow-status ${workflowId}`);
  });

  bench('Workflow check', () => {
    return run(`node ${OCTO} workflow-check ${workflowId} execution`);
  });

  bench('Workflow complete planning', () => {
    return run(`node ${OCTO} workflow-complete ${workflowId} planning --signoff`);
  });
}

// Benchmark 6: Gateway
console.log('\n=== Gateway ===');
bench('Gateway status', () => {
  return run(`node ${OCTO} gateway-status`);
});

// Cleanup
fs.rmSync(TEST_DIR, { recursive: true });

// Summary
console.log('\n' + '='.repeat(60));
console.log('Performance Summary');
console.log('='.repeat(60));

const totalMs = benchmarks.reduce((sum, b) => sum + b.ms, 0);
console.log(`Total time: ${totalMs.toFixed(2)}ms`);
console.log(`Average: ${(totalMs / benchmarks.length).toFixed(2)}ms`);

console.log('\nTop 5 slowest operations:');
benchmarks
  .sort((a, b) => b.ms - a.ms)
  .slice(0, 5)
  .forEach(b => console.log(`  ${b.name}: ${b.ms.toFixed(2)}ms`));

console.log('\nTop 5 fastest operations:');
benchmarks
  .sort((a, b) => a.ms - b.ms)
  .slice(0, 5)
  .forEach(b => console.log(`  ${b.name}: ${b.ms.toFixed(2)}ms`));

console.log('\n' + '='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

process.exit(failed === 0 ? 0 : 1);
