const fs = require('fs');
const path = require('path');

class WorkflowModule {
  constructor(engine) {
    this.engine = engine;
    this.config = engine.config;
    this.store = engine.store;
    this.logger = engine.logger;
    this.phases = ['planning', 'execution', 'security', 'documentation'];
    this.currentPhase = null;
    this.workflowDir = null;
  }

  async init() {
    this.logger.info('Workflow module initialized');
  }

  async startWorkflow(name, description) {
    this.logger.info(`Starting workflow: ${name}`);

    const timestamp = Date.now().toString(36);
    const workflowId = `${name}-${timestamp}`;
    this.workflowDir = path.join(this.engine.projectPath, 'tasks', workflowId);

    if (!fs.existsSync(this.workflowDir)) {
      fs.mkdirSync(this.workflowDir, { recursive: true });
    }

    const workflow = {
      id: workflowId,
      name,
      description,
      status: 'planning',
      currentPhase: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phases: {
        planning: { status: 'pending', completed: false, signoff: false },
        execution: { status: 'blocked', completed: false, items: [] },
        security: { status: 'blocked', completed: false, checks: [] },
        documentation: { status: 'blocked', completed: false, files: [] }
      }
    };

    fs.writeFileSync(
      path.join(this.workflowDir, 'workflow.json'),
      JSON.stringify(workflow, null, 2)
    );

    await this.createTodoTemplate(name, description);
    await this.createStepsTemplate();

    this.logger.info(`Workflow created: ${workflowId}`);
    return workflow;
  }

  async createTodoTemplate(name, description) {
    const todo = `# ${name}

## Description
${description}

## Phase 1: Planning & Verification
- [ ] Analyze codebase for relevant files
- [ ] Think through problem details
- [ ] Write implementation plan
- [ ] Identify dependencies
- [ ] Ask clarifying questions (ZERO ASSUMPTION RULE)
- [ ] **WAIT FOR USER SIGN-OFF**

## Phase 2: Execution & Simplicity
- [ ] Begin verified todo items
- [ ] Check off items as completed
- [ ] Provide continuous feedback
- [ ] Keep changes simple and minimal
- [ ] Think: "What would Mark Zuckerberg do?"

## Phase 3: Security & Quality Assurance
- [ ] Run syntax verification
- [ ] Check for security vulnerabilities
- [ ] Verify no sensitive info exposed
- [ ] Check for legacy code conflicts
- [ ] Confirm production readiness

## Phase 4: Documentation & Review
- [ ] Write educational walkthrough
- [ ] Add review section to todo.md
- [ ] Update dev.md with cleanup logs
- [ ] Document changes in steps.md

## Review Section
_After completion, add summary of changes here._

## Sign-off
- [ ] User approved plan
- [ ] All phases completed
- [ ] Production ready
`;

    fs.writeFileSync(path.join(this.workflowDir, 'todo.md'), todo);
  }

  async createStepsTemplate() {
    const steps = `# Steps Log

_Persistent record of all changes. Use this to resume if state is wiped._

## Session: ${new Date().toISOString()}

### Changes Made
_Updated as work progresses_

### Key Decisions
_Decisions that affect architecture or approach_

### Files Modified
_List of all files changed_

### Rollback Instructions
_How to undo changes if needed_
`;

    fs.writeFileSync(path.join(this.workflowDir, 'steps.md'), steps);
  }

  async createDevTemplate() {
    const dev = `# Production Clean-up Log

_Temporary functions or debug code to remove before production._

## Debug Code to Remove
_None yet_

## Temporary Functions
_None yet_

## Console Logs to Remove
_None yet_

## Environment Variables to Set
_None yet_
`;

    fs.writeFileSync(path.join(this.workflowDir, 'dev.md'), dev);
  }

  async getWorkflow(workflowId) {
    const workflowDir = path.join(this.engine.projectPath, 'tasks', workflowId);
    const workflowPath = path.join(workflowDir, 'workflow.json');

    if (!fs.existsSync(workflowPath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  }

  async listWorkflows() {
    const tasksDir = path.join(this.engine.projectPath, 'tasks');
    if (!fs.existsSync(tasksDir)) {
      return [];
    }

    const entries = fs.readdirSync(tasksDir, { withFileTypes: true });
    const workflows = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const workflowPath = path.join(tasksDir, entry.name, 'workflow.json');
        if (fs.existsSync(workflowPath)) {
          workflows.push(JSON.parse(fs.readFileSync(workflowPath, 'utf8')));
        }
      }
    }

    return workflows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async completePhase(workflowId, phase, details = {}) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const phaseIndex = this.phases.indexOf(phase);
    if (phaseIndex === -1) {
      throw new Error(`Invalid phase: ${phase}`);
    }

    workflow.phases[phase].status = 'completed';
    workflow.phases[phase].completed = true;
    workflow.phases[phase].completedAt = new Date().toISOString();
    workflow.phases[phase].details = details;

    if (phase === 'planning') {
      workflow.phases[phase].signoff = details.userSignoff || false;
      if (!workflow.phases[phase].signoff) {
        throw new Error('Planning phase requires user sign-off');
      }
    }

    if (phaseIndex < this.phases.length - 1) {
      const nextPhase = this.phases[phaseIndex + 1];
      workflow.phases[nextPhase].status = 'pending';
      workflow.currentPhase = nextPhase;
      workflow.status = nextPhase;
    } else {
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
    }

    workflow.updatedAt = new Date().toISOString();

    const workflowDir = path.join(this.engine.projectPath, 'tasks', workflowId);
    fs.writeFileSync(
      path.join(workflowDir, 'workflow.json'),
      JSON.stringify(workflow, null, 2)
    );

    this.logger.info(`Phase ${phase} completed for workflow ${workflowId}`);
    return workflow;
  }

  async checkPhase(workflowId, phase) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      return { allowed: false, reason: 'Workflow not found' };
    }

    const phaseIndex = this.phases.indexOf(phase);
    if (phaseIndex === -1) {
      return { allowed: false, reason: 'Invalid phase' };
    }

    if (phaseIndex === 0) {
      return { allowed: true, reason: 'First phase, always allowed' };
    }

    const previousPhase = this.phases[phaseIndex - 1];
    if (!workflow.phases[previousPhase].completed) {
      return {
        allowed: false,
        reason: `Previous phase (${previousPhase}) not completed`
      };
    }

    return { allowed: true, reason: 'Previous phase completed' };
  }

  async addTodoItem(workflowId, phase, item) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (!workflow.phases[phase].items) {
      workflow.phases[phase].items = [];
    }

    workflow.phases[phase].items.push({
      text: item,
      completed: false,
      createdAt: new Date().toISOString()
    });

    workflow.updatedAt = new Date().toISOString();

    const workflowDir = path.join(this.engine.projectPath, 'tasks', workflowId);
    fs.writeFileSync(
      path.join(workflowDir, 'workflow.json'),
      JSON.stringify(workflow, null, 2)
    );

    return workflow;
  }

  async completeTodoItem(workflowId, phase, itemIndex) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.phases[phase].items && workflow.phases[phase].items[itemIndex]) {
      workflow.phases[phase].items[itemIndex].completed = true;
      workflow.phases[phase].items[itemIndex].completedAt = new Date().toISOString();
    }

    workflow.updatedAt = new Date().toISOString();

    const workflowDir = path.join(this.engine.projectPath, 'tasks', workflowId);
    fs.writeFileSync(
      path.join(workflowDir, 'workflow.json'),
      JSON.stringify(workflow, null, 2)
    );

    return workflow;
  }

  async updateSteps(workflowId, section, content) {
    const stepsPath = path.join(
      this.engine.projectPath,
      'tasks',
      workflowId,
      'steps.md'
    );

    if (!fs.existsSync(stepsPath)) {
      throw new Error(`Steps file not found for workflow: ${workflowId}`);
    }

    let steps = fs.readFileSync(stepsPath, 'utf8');
    const sectionRegex = new RegExp(`### ${section}[\\s\\S]*?(?=\\n### |$)`);
    const replacement = `### ${section}\n${content}\n`;

    if (sectionRegex.test(steps)) {
      steps = steps.replace(sectionRegex, replacement);
    } else {
      steps += `\n${replacement}`;
    }

    fs.writeFileSync(stepsPath, steps);
    this.logger.info(`Updated steps.md for workflow ${workflowId}`);
  }

  async updateTodo(workflowId, itemText, completed = false) {
    const todoPath = path.join(
      this.engine.projectPath,
      'tasks',
      workflowId,
      'todo.md'
    );

    if (!fs.existsSync(todoPath)) {
      throw new Error(`Todo file not found for workflow: ${workflowId}`);
    }

    let todo = fs.readFileSync(todoPath, 'utf8');
    const checkbox = completed ? '[x]' : '[ ]';
    const regex = new RegExp(`- \\[[ x]\\] ${itemText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    
    if (regex.test(todo)) {
      todo = todo.replace(regex, `- ${checkbox} ${itemText}`);
    }

    fs.writeFileSync(todoPath, todo);
  }

  async createDevLog(workflowId) {
    const devPath = path.join(
      this.engine.projectPath,
      'tasks',
      workflowId,
      'dev.md'
    );

    if (!fs.existsSync(devPath)) {
      await this.createDevTemplate();
    }

    return devPath;
  }

  async getWorkflowStatus(workflowId) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      return null;
    }

    const completedPhases = Object.values(workflow.phases)
      .filter(p => p.completed).length;

    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      currentPhase: workflow.currentPhase,
      progress: `${completedPhases}/${this.phases.length} phases`,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt
    };
  }
}

module.exports = WorkflowModule;
