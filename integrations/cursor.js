const fs = require('fs');
const path = require('path');

class CursorAdapter {
  constructor(engine) {
    this.engine = engine;
    this.name = 'cursor';
    this.projectPath = engine?.projectPath || process.cwd();
  }

  async install() {
    const dirs = [
      path.join(this.projectPath, '.cursor'),
      path.join(this.projectPath, '.cursor', 'rules')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await this.installRules();
    await this.installSettings();

    return { success: true, message: 'Cursor adapter installed' };
  }

  async installRules() {
    const rules = `# Octo-POA Rules for Cursor

## Before Editing Files
- Query the knowledge graph first: \`octo query "find <file>"\`
- Check memory for past decisions: \`octo recall <topic>\`

## After Making Changes
- Store observations: \`octo remember "Changed <what> because <why>"\`
- Update knowledge graph: \`octo graph-scan\`

## Token Optimization
- Use compressed output when possible
- Query graph instead of reading files directly

## Memory System
- All decisions should be stored in memory
- Search memory before making new decisions
- Cross-reference with past sessions

## Knowledge Graph
- Scan codebase regularly: \`octo graph-scan\`
- Query before reading: \`octo query "dependencies of <module>"\`
- Use graph for impact analysis

## Gateway Integration
- Check external tools: \`octo gateway-status\`
- Route complex workflows to n8n
- Use crewAI for multi-agent tasks
`;

    fs.writeFileSync(
      path.join(this.projectPath, '.cursor', 'rules', 'octo-poa.md'),
      rules
    );
  }

  async installSettings() {
    const settingsPath = path.join(this.projectPath, '.cursor', 'settings.json');
    let settings = {};

    if (fs.existsSync(settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (e) {
        settings = {};
      }
    }

    if (!settings.customInstructions) {
      settings.customInstructions = '';
    }

    settings.customInstructions += '\n\n## Octo-POA Integration\nUse octo commands for memory, knowledge graph, and token optimization.';

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  async uninstall() {
    const files = [
      path.join(this.projectPath, '.cursor', 'rules', 'octo-poa.md')
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }

    return { success: true, message: 'Cursor adapter uninstalled' };
  }
}

module.exports = CursorAdapter;
