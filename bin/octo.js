#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const OctoEngine = require('../lib/core/engine');

const chalk = {
  green: (t) => t,
  yellow: (t) => t,
  dim: (t) => t,
  red: (t) => t,
  cyan: (t) => t
};

const program = new Command();

program
  .name('octo')
  .description('Octo-POA - Parallel Operating Agent for AI coding agents')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Octo-POA in current directory')
  .action(async () => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    console.log(chalk.green('✓ Octo-POA initialized'));
    console.log(chalk.dim('  Created .octo/ directory'));
    console.log(chalk.dim('  Created .octo/config.json'));
    console.log(chalk.dim('  Created .octo/octo.db'));
    engine.close();
  });

program
  .command('plan-constitution')
  .description('Create project principles')
  .action(async () => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const planner = await engine.getPlanner();
    if (planner) {
      await planner.createConstitution();
      console.log(chalk.green('✓ Constitution created'));
    } else {
      console.log(chalk.yellow('Planning module not yet implemented'));
    }
    engine.close();
  });

program
  .command('specify <feature>')
  .description('Create feature specification')
  .action(async (feature) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const planner = await engine.getPlanner();
    if (planner) {
      await planner.createSpec(feature);
      console.log(chalk.green('✓ Specification created'));
    } else {
      console.log(chalk.yellow('Planning module not yet implemented'));
    }
    engine.close();
  });

program
  .command('compress <text>')
  .description('Compress output text')
  .option('-l, --level <level>', 'Compression level (lite/full/ultra)', 'full')
  .action(async (text, options) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const execution = await engine.getExecution();
    if (execution) {
      const result = execution.compress(text, options.level);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.yellow('Execution module not yet implemented'));
    }
    engine.close();
  });

program
  .command('remember <observation>')
  .description('Store observation in memory')
  .action(async (observation) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const memory = await engine.getMemory();
    if (memory) {
      await memory.remember(observation);
      console.log(chalk.green('✓ Stored'));
    } else {
      console.log(chalk.yellow('Memory module not yet implemented'));
    }
    engine.close();
  });

program
  .command('recall <query>')
  .description('Search memory')
  .action(async (query) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const memory = await engine.getMemory();
    if (memory) {
      const results = await memory.recall(query);
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(chalk.yellow('Memory module not yet implemented'));
    }
    engine.close();
  });

program
  .command('graph-scan')
  .description('Scan codebase for knowledge graph')
  .action(async () => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const knowledge = await engine.getKnowledge();
    if (knowledge) {
      const result = await knowledge.scan();
      console.log(chalk.green(`✓ Scanned ${result.filesProcessed} files`));
    } else {
      console.log(chalk.yellow('Knowledge module not yet implemented'));
    }
    engine.close();
  });

program
  .command('query <question>')
  .description('Query knowledge graph')
  .action(async (question) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const knowledge = await engine.getKnowledge();
    if (knowledge) {
      const result = await knowledge.query(question);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(chalk.yellow('Knowledge module not yet implemented'));
    }
    engine.close();
  });

program
  .command('gateway-status')
  .description('Check external tool connections')
  .action(async () => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const gateway = await engine.getGateway();
    if (gateway) {
      const status = await gateway.status();
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(chalk.yellow('Gateway module not yet implemented'));
    }
    engine.close();
  });

program
  .command('config-show')
  .description('Show configuration')
  .action(() => {
    const engine = new OctoEngine(process.cwd());
    console.log(JSON.stringify(engine.config.config, null, 2));
    engine.close();
  });

program
  .command('session-start')
  .description('Start new session')
  .action(async () => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    console.log(chalk.green('✓ Session started'));
    console.log(chalk.dim('  Session ID:', Date.now().toString(36)));
    engine.close();
  });

program
  .command('install <agent>')
  .description('Install adapter for agent (claude/codex/gemini/cursor/generic)')
  .action(async (agent) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const { getAdapter } = require('../integrations');
    const adapter = getAdapter(agent, engine);
    const result = await adapter.install();
    console.log(chalk.green(`✓ ${result.message}`));
    engine.close();
  });

program
  .command('uninstall <agent>')
  .description('Uninstall adapter for agent')
  .action(async (agent) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const { getAdapter } = require('../integrations');
    const adapter = getAdapter(agent, engine);
    const result = await adapter.uninstall();
    console.log(chalk.green(`✓ ${result.message}`));
    engine.close();
  });

program
  .command('list-agents')
  .description('List available agent adapters')
  .action(() => {
    const { listAdapters } = require('../integrations');
    const agents = listAdapters();
    console.log('Available adapters:');
    agents.forEach(a => console.log(`  - ${a}`));
  });

program
  .command('workflow-start <name> <description>')
  .description('Start a new execution workflow')
  .action(async (name, description) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    const result = await workflow.startWorkflow(name, description);
    console.log(chalk.green(`✓ Workflow started: ${result.id}`));
    console.log(chalk.dim(`  Phase: ${result.currentPhase}`));
    console.log(chalk.dim(`  Todo: tasks/${result.id}/todo.md`));
    engine.close();
  });

program
  .command('workflow-list')
  .description('List all workflows')
  .action(async () => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    const workflows = await workflow.listWorkflows();
    if (workflows.length === 0) {
      console.log('No workflows found');
    } else {
      console.log('Workflows:');
      workflows.forEach(w => {
        console.log(`  - ${w.id}: ${w.status} (${w.currentPhase})`);
      });
    }
    engine.close();
  });

program
  .command('workflow-status <workflowId>')
  .description('Get workflow status')
  .action(async (workflowId) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    const status = await workflow.getWorkflowStatus(workflowId);
    if (status) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(chalk.yellow('Workflow not found'));
    }
    engine.close();
  });

program
  .command('workflow-complete <workflowId> <phase>')
  .description('Complete a workflow phase')
  .option('--signoff', 'User sign-off for planning phase')
  .action(async (workflowId, phase, options) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    try {
      const details = {};
      if (phase === 'planning' && options.signoff) {
        details.userSignoff = true;
      }
      const result = await workflow.completePhase(workflowId, phase, details);
      console.log(chalk.green(`✓ Phase ${phase} completed`));
      console.log(chalk.dim(`  Next phase: ${result.currentPhase || 'done'}`));
    } catch (e) {
      console.log(chalk.red(`✗ ${e.message}`));
    }
    engine.close();
  });

program
  .command('workflow-check <workflowId> <phase>')
  .description('Check if phase is allowed')
  .action(async (workflowId, phase) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    const check = await workflow.checkPhase(workflowId, phase);
    if (check.allowed) {
      console.log(chalk.green(`✓ Phase ${phase} allowed: ${check.reason}`));
    } else {
      console.log(chalk.red(`✗ Phase ${phase} blocked: ${check.reason}`));
    }
    engine.close();
  });

program
  .command('workflow-todo <workflowId> <item>')
  .description('Add todo item to workflow')
  .option('-p, --phase <phase>', 'Phase to add to', 'planning')
  .action(async (workflowId, item, options) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    await workflow.addTodoItem(workflowId, options.phase, item);
    console.log(chalk.green('✓ Added todo item'));
    engine.close();
  });

program
  .command('workflow-steps <workflowId> <section> <content>')
  .description('Update steps log')
  .action(async (workflowId, section, content) => {
    const engine = new OctoEngine(process.cwd());
    await engine.init();
    const workflow = await engine.getWorkflow();
    await workflow.updateSteps(workflowId, section, content);
    console.log(chalk.green('✓ Updated steps.md'));
    engine.close();
  });

program.parse();
