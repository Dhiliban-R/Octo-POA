const path = require('path');
const fs = require('fs');

class Logger {
  constructor(config) {
    this.level = config?.get('logLevel') || 'info';
    this.quiet = config?.get('quiet') || false;
    this.logFile = config ? path.join(config.getOctoDir(), 'octo.log') : null;
  }

  log(level, ...args) {
    if (this.quiet && level !== 'error') return;

    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] < levels[this.level]) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (level === 'error') {
      console.error(prefix, ...args);
    } else if (level === 'warn') {
      console.warn(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }

    if (this.logFile) {
      try {
        const dir = path.dirname(this.logFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(this.logFile, `${prefix} ${args.join(' ')}\n`);
      } catch (e) {
        // Silent fail on log write errors
      }
    }
  }

  debug(...args) { this.log('debug', ...args); }
  info(...args) { this.log('info', ...args); }
  warn(...args) { this.log('warn', ...args); }
  error(...args) { this.log('error', ...args); }
}

module.exports = Logger;
