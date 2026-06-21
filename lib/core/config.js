const path = require('path');
const fs = require('fs');

class Config {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.globalConfigPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.octo-poa',
      'config.json'
    );
    this.projectConfigPath = path.join(this.projectPath, '.octo', 'config.json');
    this.config = this.load();
  }

  load() {
    const defaults = {
      version: '0.1.0',
      core: {
        compressionLevel: 'full',
        yagniLevel: 'full',
        memoryBudget: 2000,
        knowledgeEnabled: true
      },
      gateway: {
        router: {
          enabled: false,
          url: 'http://localhost:20128/v1',
          fallbackChain: ['anthropic', 'openai', 'gemini']
        },
        n8n: {
          enabled: false,
          url: 'http://localhost:5678/api/v1',
          apiKey: ''
        },
        crewai: {
          enabled: false,
          pythonPath: 'python3'
        },
        openclaw: {
          enabled: false,
          wsUrl: 'ws://localhost:18789'
        }
      },
      agents: {
        defaultAgent: 'claude',
        agents: {
          claude: { enabled: true },
          codex: { enabled: false },
          gemini: { enabled: false }
        }
      }
    };

    let config = { ...defaults };

    if (fs.existsSync(this.globalConfigPath)) {
      try {
        const globalConfig = JSON.parse(fs.readFileSync(this.globalConfigPath, 'utf8'));
        config = this.merge(config, globalConfig);
      } catch (e) {
        console.warn('Failed to load global config:', e.message);
      }
    }

    if (fs.existsSync(this.projectConfigPath)) {
      try {
        const projectConfig = JSON.parse(fs.readFileSync(this.projectConfigPath, 'utf8'));
        config = this.merge(config, projectConfig);
      } catch (e) {
        console.warn('Failed to load project config:', e.message);
      }
    } else {
      // Save default config to project
      try {
        const dir = path.dirname(this.projectConfigPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.projectConfigPath, JSON.stringify(config, null, 2));
      } catch (e) {
        // Silent fail
      }
    }

    return config;
  }

  merge(defaults, overrides) {
    const result = { ...defaults };
    for (const key of Object.keys(overrides)) {
      if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) && overrides[key] !== null) {
        result[key] = this.merge(defaults[key] || {}, overrides[key]);
      } else {
        result[key] = overrides[key];
      }
    }
    return result;
  }

  get(key, defaultValue) {
    const keys = key.split('.');
    let value = this.config;
    for (const k of keys) {
      value = value?.[k];
    }
    return value !== undefined ? value : defaultValue;
  }

  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  }

  save(target = 'project') {
    const configPath = target === 'global' ? this.globalConfigPath : this.projectConfigPath;
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  getOctoDir() {
    return path.join(this.projectPath, '.octo');
  }

  ensureOctoDir() {
    const octoDir = this.getOctoDir();
    const dirs = [
      octoDir,
      path.join(octoDir, 'sessions'),
      path.join(octoDir, 'graph'),
      path.join(octoDir, 'memory'),
      path.join(octoDir, 'tokens'),
      path.join(octoDir, 'workflows')
    ];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    return octoDir;
  }
}

module.exports = Config;
