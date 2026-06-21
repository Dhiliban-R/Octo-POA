const fs = require('fs');
const path = require('path');

class GeminiAdapter {
  constructor(engine) {
    this.engine = engine;
    this.name = 'gemini';
    this.configDir = path.join(process.env.HOME, '.gemini');
  }

  async install() {
    const dirs = [
      this.configDir,
      path.join(this.configDir, 'extensions')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await this.installExtension();
    await this.installAgentsMd();

    return { success: true, message: 'Gemini CLI adapter installed' };
  }

  async installExtension() {
    const extension = {
      name: 'octo-poa',
      version: '0.1.0',
      description: 'Octo-POA integration for Gemini CLI',
      entryPoint: 'extension.js'
    };

    fs.writeFileSync(
      path.join(this.configDir, 'extensions', 'octo-poa.json'),
      JSON.stringify(extension, null, 2)
    );

    const entryPoint = `const { execSync } = require('child_process');

module.exports = {
  name: 'octo-poa',
  
  async onSessionStart(context) {
    try {
      const output = execSync('octo session-start', { encoding: 'utf8' });
      context.addSystemMessage(output);
    } catch (e) {
      // Silent fail
    }
  },
  
  async onPrompt(prompt, context) {
    if (prompt.startsWith('/octo ')) {
      const command = prompt.slice(5);
      try {
        const output = execSync(\`octo \${command}\`, { encoding: 'utf8' });
        return { response: output };
      } catch (e) {
        return { response: 'Command failed: ' + e.message };
      }
    }
    return null;
  }
};
`;

    fs.writeFileSync(
      path.join(this.configDir, 'extensions', 'octo-poa.js'),
      entryPoint
    );
  }

  async installAgentsMd() {
    const agentsMd = `# Octo-POA Integration

## Available Commands
- \`octo init\` - Initialize Octo-POA
- \`octo plan-constitution\` - Create project principles
- \`octo specify <feature>\` - Create feature specification
- \`octo compress <text>\` - Compress output
- \`octo remember <observation>\` - Store in memory
- \`octo recall <query>\` - Search memory
- \`octo graph-scan\` - Scan codebase
- \`octo query <question>\` - Query knowledge graph
- \`octo gateway-status\` - Check external connections

## Usage
When working on a project with Octo-POA initialized:
1. Query the knowledge graph before reading files
2. Use memory to recall past decisions
3. Compress output for token savings
4. Use gateway for external tool integration
`;

    fs.writeFileSync(
      path.join(this.configDir, 'AGENTS.md'),
      agentsMd
    );
  }

  async uninstall() {
    const files = [
      path.join(this.configDir, 'extensions', 'octo-poa.json'),
      path.join(this.configDir, 'extensions', 'octo-poa.js'),
      path.join(this.configDir, 'AGENTS.md')
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }

    return { success: true, message: 'Gemini CLI adapter uninstalled' };
  }
}

module.exports = GeminiAdapter;
