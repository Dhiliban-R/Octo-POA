const fs = require('fs');
const path = require('path');

class SessionManager {
  constructor(octoDir = '.octo') {
    this.octoDir = octoDir;
    this.sessionsPath = path.join(octoDir, 'sessions');
  }

  init() {
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
    }
  }

  create(name) {
    this.init();
    
    const sessionId = name || `session-${Date.now()}`;
    const sessionDir = path.join(this.sessionsPath, sessionId);
    
    if (fs.existsSync(sessionDir)) {
      console.error(`Session '${sessionId}' already exists`);
      return null;
    }
    
    fs.mkdirSync(sessionDir, { recursive: true });
    
    const now = new Date().toISOString();
    
    fs.writeFileSync(
      path.join(sessionDir, 'CONTEXT.md'),
      `# Session: ${sessionId}\n\n## Started\n${now}\n\n## Context\n\n\n`
    );
    
    fs.writeFileSync(
      path.join(sessionDir, 'DECISIONS.md'),
      `# Decisions: ${sessionId}\n\n## ${now}\n\n- \n\n`
    );
    
    fs.writeFileSync(
      path.join(sessionDir, 'PROGRESS.md'),
      `# Progress: ${sessionId}\n\n## Completed\n\n## In Progress\n\n## Blocked\n\n`
    );
    
    fs.writeFileSync(
      path.join(sessionDir, 'ISSUES.md'),
      `# Issues: ${sessionId}\n\n`
    );
    
    fs.writeFileSync(
      path.join(sessionDir, 'TOKENS.json'),
      JSON.stringify({
        session: sessionId,
        start: now,
        total: 0,
        saved: 0,
        breakdown: {
          deduplication: 0,
          summarization: 0,
          compression: 0,
          lazyLoading: 0
        }
      }, null, 2)
    );
    
    return sessionId;
  }

  list() {
    this.init();
    
    if (!fs.existsSync(this.sessionsPath)) {
      return [];
    }
    
    return fs.readdirSync(this.sessionsPath).filter(name => {
      const stat = fs.statSync(path.join(this.sessionsPath, name));
      return stat.isDirectory();
    });
  }

  get(name) {
    const sessionDir = path.join(this.sessionsPath, name);
    
    if (!fs.existsSync(sessionDir)) {
      return null;
    }
    
    return {
      id: name,
      context: this.readFile(path.join(sessionDir, 'CONTEXT.md')),
      decisions: this.readFile(path.join(sessionDir, 'DECISIONS.md')),
      progress: this.readFile(path.join(sessionDir, 'PROGRESS.md')),
      issues: this.readFile(path.join(sessionDir, 'ISSUES.md')),
      tokens: this.readJSON(path.join(sessionDir, 'TOKENS.json'))
    };
  }

  updateContext(name, content) {
    const sessionDir = path.join(this.sessionsPath, name);
    
    if (!fs.existsSync(sessionDir)) {
      return false;
    }
    
    fs.writeFileSync(path.join(sessionDir, 'CONTEXT.md'), content);
    return true;
  }

  addDecision(name, decision) {
    const sessionDir = path.join(this.sessionsPath, name);
    
    if (!fs.existsSync(sessionDir)) {
      return false;
    }
    
    const decisionsPath = path.join(sessionDir, 'DECISIONS.md');
    const existing = fs.readFileSync(decisionsPath, 'utf-8');
    
    const timestamp = new Date().toISOString();
    fs.writeFileSync(
      decisionsPath,
      existing + `\n## ${timestamp}\n\n- ${decision}\n`
    );
    
    return true;
  }

  updateProgress(name, progress) {
    const sessionDir = path.join(this.sessionsPath, name);
    
    if (!fs.existsSync(sessionDir)) {
      return false;
    }
    
    fs.writeFileSync(path.join(sessionDir, 'PROGRESS.md'), progress);
    return true;
  }

  addIssue(name, issue) {
    const sessionDir = path.join(this.sessionsPath, name);
    
    if (!fs.existsSync(sessionDir)) {
      return false;
    }
    
    const issuesPath = path.join(sessionDir, 'ISSUES.md');
    const existing = fs.readFileSync(issuesPath, 'utf-8');
    
    const timestamp = new Date().toISOString();
    fs.writeFileSync(
      issuesPath,
      existing + `\n## ${timestamp}\n\n- ${issue}\n`
    );
    
    return true;
  }

  recordTokens(name, tokens) {
    const sessionDir = path.join(this.sessionsPath, name);
    
    if (!fs.existsSync(sessionDir)) {
      return false;
    }
    
    const tokensPath = path.join(sessionDir, 'TOKENS.json');
    const existing = this.readJSON(tokensPath);
    
    const updated = {
      ...existing,
      total: existing.total + tokens.total,
      saved: existing.saved + tokens.saved,
      breakdown: {
        deduplication: existing.breakdown.deduplication + (tokens.breakdown.deduplication || 0),
        summarization: existing.breakdown.summarization + (tokens.breakdown.summarization || 0),
        compression: existing.breakdown.compression + (tokens.breakdown.compression || 0),
        lazyLoading: existing.breakdown.lazyLoading + (tokens.breakdown.lazyLoading || 0)
      }
    };
    
    fs.writeFileSync(tokensPath, JSON.stringify(updated, null, 2));
    return true;
  }

  getLastSession() {
    const sessions = this.list();
    
    if (sessions.length === 0) {
      return null;
    }
    
    return sessions[sessions.length - 1];
  }

  getRelay(fromSession, toSession) {
    const from = this.get(fromSession);
    const to = this.get(toSession);
    
    if (!from || !to) {
      return null;
    }
    
    return {
      from: {
        id: fromSession,
        completed: from.progress.match(/## Completed\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim() || '',
        decisions: from.decisions,
        issues: from.issues
      },
      to: {
        id: toSession,
        context: to.context,
        progress: to.progress
      }
    };
  }

  readFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return '';
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
}

module.exports = SessionManager;
