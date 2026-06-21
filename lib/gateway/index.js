const http = require('http');
const https = require('https');

class GatewayModule {
  constructor(engine) {
    this.engine = engine;
    this.config = engine.config;
    this.store = engine.store;
    this.logger = engine.logger;
    this.connections = {};
  }

  async init() {
    this.logger.info('Gateway module initialized');

    const gatewayConfig = this.config.get('gateway', {});

    if (gatewayConfig.router?.enabled) {
      this.connections.router = new RouterConnection(gatewayConfig.router, this.logger);
    }

    if (gatewayConfig.n8n?.enabled) {
      this.connections.n8n = new N8nConnection(gatewayConfig.n8n, this.logger);
    }

    if (gatewayConfig.crewai?.enabled) {
      this.connections.crewai = new CrewAIConnection(gatewayConfig.crewai, this.logger);
    }

    if (gatewayConfig.openclaw?.enabled) {
      this.connections.openclaw = new OpenClawConnection(gatewayConfig.openclaw, this.logger);
    }
  }

  async route(tool, ...args) {
    this.logger.info(`Routing to: ${tool}`);

    switch (tool) {
      case 'router':
        return this.connections.router?.route(...args);
      case 'n8n':
        return this.connections.n8n?.trigger(...args);
      case 'crewai':
        return this.connections.crewai?.execute(...args);
      case 'openclaw':
        return this.connections.openclaw?.send(...args);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  async status() {
    const status = {};

    for (const [name, connection] of Object.entries(this.connections)) {
      try {
        status[name] = await connection.healthCheck();
      } catch (e) {
        status[name] = { connected: false, error: e.message };
      }
    }

    return status;
  }
}

class RouterConnection {
  constructor(config, logger) {
    this.baseUrl = config.url || 'http://localhost:20128/v1';
    this.fallbackChain = config.fallbackChain || ['anthropic', 'openai', 'gemini'];
    this.logger = logger;
  }

  async route(request) {
    this.logger.info(`Routing to 9router: ${this.baseUrl}`);

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/chat/completions`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data });
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`9router error: ${e.message}`);
        reject(e);
      });

      req.write(JSON.stringify(request));
      req.end();
    });
  }

  async healthCheck() {
    return new Promise((resolve) => {
      const url = new URL(`${this.baseUrl}/models`);
      const req = http.get(url.href, (res) => {
        resolve({ connected: true, status: res.statusCode });
      });
      req.on('error', () => {
        resolve({ connected: false });
      });
      req.setTimeout(2000, () => {
        req.destroy();
        resolve({ connected: false, timeout: true });
      });
    });
  }
}

class N8nConnection {
  constructor(config, logger) {
    this.baseUrl = config.url || 'http://localhost:5678/api/v1';
    this.apiKey = config.apiKey;
    this.logger = logger;
  }

  async trigger(workflowId, data) {
    this.logger.info(`Triggering n8n workflow: ${workflowId}`);

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/workflows/${workflowId}/activate`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data });
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`n8n error: ${e.message}`);
        reject(e);
      });

      req.write(JSON.stringify(data));
      req.end();
    });
  }

  async healthCheck() {
    return new Promise((resolve) => {
      const url = new URL(`${this.baseUrl}/workflows`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      };
      const req = http.get(options, (res) => {
        resolve({ connected: true, status: res.statusCode });
      });
      req.on('error', () => {
        resolve({ connected: false });
      });
      req.setTimeout(2000, () => {
        req.destroy();
        resolve({ connected: false, timeout: true });
      });
    });
  }
}

class CrewAIConnection {
  constructor(config, logger) {
    this.pythonPath = config.pythonPath || 'python3';
    this.logger = logger;
  }

  async execute(config) {
    this.logger.info('Executing crewAI crew');

    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, ['-c', `
import json
from crewai import Crew, Agent, Task

config = json.loads('${JSON.stringify(config)}')
# Execute crew logic here
print(json.dumps({"status": "executed"}))
`]);

      let output = '';
      process.stdout.on('data', (data) => { output += data; });
      process.stderr.on('data', (data) => { this.logger.error(data.toString()); });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            resolve({ raw: output });
          }
        } else {
          reject(new Error(`crewAI exited with code ${code}`));
        }
      });
    });
  }

  async healthCheck() {
    const { spawn } = require('child_process');

    return new Promise((resolve) => {
      const process = spawn(this.pythonPath, ['-c', 'import crewai; print("ok")']);
      process.on('close', (code) => {
        resolve({ connected: code === 0 });
      });
      process.on('error', () => {
        resolve({ connected: false });
      });
    });
  }
}

class OpenClawConnection {
  constructor(config, logger) {
    this.wsUrl = config.wsUrl || 'ws://localhost:18789';
    this.restUrl = config.restUrl || 'http://localhost:18789';
    this.logger = logger;
  }

  async send(channel, message) {
    this.logger.info(`Sending via openclaw: ${channel}`);

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.restUrl}/api/messages`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data });
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`openclaw error: ${e.message}`);
        reject(e);
      });

      req.write(JSON.stringify({ channel, message }));
      req.end();
    });
  }

  async healthCheck() {
    return new Promise((resolve) => {
      const url = new URL(`${this.restUrl}/api/health`);
      const req = http.get(url.href, (res) => {
        resolve({ connected: true, status: res.statusCode });
      });
      req.on('error', () => {
        resolve({ connected: false });
      });
      req.setTimeout(2000, () => {
        req.destroy();
        resolve({ connected: false, timeout: true });
      });
    });
  }
}

module.exports = GatewayModule;
