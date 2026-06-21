const Config = require('./config');
const Store = require('./store');
const Logger = require('./logger');
const path = require('path');
const fs = require('fs');

class OctoEngine {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.config = new Config(this.projectPath);
    this.logger = new Logger(this.config);
    this.store = null;

    this.planner = null;
    this.execution = null;
    this.memory = null;
    this.knowledge = null;
    this.gateway = null;
    this.workflow = null;
  }

  async init() {
    this.logger.info('Initializing Octo-POA...');

    this.config.ensureOctoDir();

    this.store = new Store(this.config);
    this.store.init();

    this.logger.info('Core engine initialized');

    return this;
  }

  async loadModule(name) {
    const modulePath = path.join(__dirname, '..', name, 'index.js');
    if (fs.existsSync(modulePath)) {
      const Module = require(modulePath);
      const instance = new Module(this);
      await instance.init?.();
      return instance;
    }
    return null;
  }

  async getPlanner() {
    if (!this.planner) {
      this.planner = await this.loadModule('planner');
    }
    return this.planner;
  }

  async getExecution() {
    if (!this.execution) {
      this.execution = await this.loadModule('execution');
    }
    return this.execution;
  }

  async getMemory() {
    if (!this.memory) {
      this.memory = await this.loadModule('memory');
    }
    return this.memory;
  }

  async getKnowledge() {
    if (!this.knowledge) {
      this.knowledge = await this.loadModule('knowledge');
    }
    return this.knowledge;
  }

  async getGateway() {
    if (!this.gateway) {
      this.gateway = await this.loadModule('gateway');
    }
    return this.gateway;
  }

  async getWorkflow() {
    if (!this.workflow) {
      this.workflow = await this.loadModule('workflow');
    }
    return this.workflow;
  }

  async plan(feature) {
    const planner = await this.getPlanner();
    if (!planner) {
      throw new Error('Planning module not available');
    }
    return planner.createPlan(feature);
  }

  async compress(text, level) {
    const execution = await this.getExecution();
    if (!execution) {
      throw new Error('Execution module not available');
    }
    return execution.compress(text, level);
  }

  async remember(observation, type = 'observation') {
    const memory = await this.getMemory();
    if (!memory) {
      throw new Error('Memory module not available');
    }
    return memory.remember(observation, type);
  }

  async recall(query) {
    const memory = await this.getMemory();
    if (!memory) {
      throw new Error('Memory module not available');
    }
    return memory.recall(query);
  }

  async scan(projectPath) {
    const knowledge = await this.getKnowledge();
    if (!knowledge) {
      throw new Error('Knowledge module not available');
    }
    return knowledge.scan(projectPath || this.projectPath);
  }

  async graphQuery(query) {
    const knowledge = await this.getKnowledge();
    if (!knowledge) {
      throw new Error('Knowledge module not available');
    }
    return knowledge.query(query);
  }

  async routeToGateway(tool, ...args) {
    const gateway = await this.getGateway();
    if (!gateway) {
      throw new Error('Gateway module not available');
    }
    return gateway.route(tool, ...args);
  }

  close() {
    if (this.store) {
      this.store.close();
    }
    this.logger.info('Octo-POA shut down');
  }
}

module.exports = OctoEngine;
