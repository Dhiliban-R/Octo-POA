const fs = require('fs');
const path = require('path');

class ClaudeAdapter {
  constructor(engine) {
    this.engine = engine;
    this.name = 'claude';
    this.configDir = path.join(process.env.HOME, '.claude');
  }

  async install() {
    const dirs = [
      this.configDir,
      path.join(this.configDir, 'commands'),
      path.join(this.configDir, 'hooks')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await this.installCommands();
    await this.installHooks();
    await this.installSettings();

    return { success: true, message: 'Claude Code adapter installed' };
  }

  async installCommands() {
    const commands = {
      'octo-constitution.md': `# Create Project Constitution
Run \`octo plan-constitution\` to create your project's 9 Articles of Development.`,

      'octo-specify.md': `# Create Feature Specification
Describe the feature you want to build. Octo-POA will create a structured specification with user stories, requirements, and success criteria.`,

      'octo-compress.md': `# Compress Output
Enable output compression. Use \`/octo-compress [lite|full|ultra]\` to set level.`,

      'octo-memory.md': `# Memory Commands
- \`/octo-memory remember <observation>\` - Store observation
- \`/octo-memory recall <query>\` - Search memory
- \`/octo-memory context\` - Get session context`,

      'octo-graph.md': `# Knowledge Graph
- \`/octo-graph scan\` - Scan codebase
- \`/octo-graph query <question>\` - Query graph
- \`/octo-graph compress\` - Compress context`
    };

    for (const [name, content] of Object.entries(commands)) {
      fs.writeFileSync(
        path.join(this.configDir, 'commands', name),
        content
      );
    }
  }

  async installHooks() {
    const hooks = {
      'octo-session-start.js': `const { execSync } = require('child_process');

module.exports = async function sessionStart() {
  try {
    const output = execSync('octo session-start', { encoding: 'utf8' });
    return { hookSpecificOutput: output };
  } catch (e) {
    return {};
  }
};`,

      'octo-prompt-submit.js': `const { execSync } = require('child_process');

module.exports = async function promptSubmit(prompt) {
  if (prompt.includes('/octo-memory remember')) {
    const observation = prompt.replace('/octo-memory remember', '').trim();
    try {
      execSync(\`octo remember "\${observation}"\`, { encoding: 'utf8' });
      return { hookSpecificOutput: '✓ Stored in memory' };
    } catch (e) {
      return { hookSpecificOutput: 'Failed to store' };
    }
  }
  return {};
};`
    };

    for (const [name, content] of Object.entries(hooks)) {
      fs.writeFileSync(
        path.join(this.configDir, 'hooks', name),
        content
      );
    }
  }

  async installSettings() {
    const settingsPath = path.join(this.configDir, 'settings.json');
    let settings = {};

    if (fs.existsSync(settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (e) {
        settings = {};
      }
    }

    if (!settings.hooks) settings.hooks = {};
    if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];
    if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];

    settings.hooks.SessionStart.push({
      type: 'command',
      command: 'node ~/.claude/hooks/octo-session-start.js'
    });

    settings.hooks.UserPromptSubmit.push({
      type: 'command',
      command: 'node ~/.claude/hooks/octo-prompt-submit.js'
    });

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  async uninstall() {
    const files = [
      path.join(this.configDir, 'commands', 'octo-constitution.md'),
      path.join(this.configDir, 'commands', 'octo-specify.md'),
      path.join(this.configDir, 'commands', 'octo-compress.md'),
      path.join(this.configDir, 'commands', 'octo-memory.md'),
      path.join(this.configDir, 'commands', 'octo-graph.md'),
      path.join(this.configDir, 'hooks', 'octo-session-start.js'),
      path.join(this.configDir, 'hooks', 'octo-prompt-submit.js')
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }

    return { success: true, message: 'Claude Code adapter uninstalled' };
  }
}

module.exports = ClaudeAdapter;
