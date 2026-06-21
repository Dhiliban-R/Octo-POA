const fs = require('fs');
const path = require('path');

class CodexAdapter {
  constructor(engine) {
    this.engine = engine;
    this.name = 'codex';
    this.configDir = path.join(process.env.HOME, '.codex');
  }

  async install() {
    const dirs = [
      this.configDir,
      path.join(this.configDir, 'commands')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await this.installCommands();
    await this.installPlugin();

    return { success: true, message: 'OpenAI Codex adapter installed' };
  }

  async installCommands() {
    const commands = {
      'octo.toml': `name = "octo"
description = "Octo-POA commands"
version = "0.1.0"

[[commands]]
name = "constitution"
description = "Create project principles"
prompt = "Run \`octo plan-constitution\` to create your project's 9 Articles of Development."

[[commands]]
name = "specify"
description = "Create feature specification"
prompt = "Describe the feature you want to build. Octo-POA will create a structured specification."

[[commands]]
name = "compress"
description = "Compress output"
prompt = "Enable caveman-style output compression for token savings."

[[commands]]
name = "memory"
description = "Memory commands"
prompt = "Use \`octo remember\` and \`octo recall\` for persistent memory."

[[commands]]
name = "graph"
description = "Knowledge graph"
prompt = "Use \`octo graph-scan\` and \`octo query\` for knowledge graph operations."
`
    };

    for (const [name, content] of Object.entries(commands)) {
      fs.writeFileSync(
        path.join(this.configDir, 'commands', name),
        content
      );
    }
  }

  async installPlugin() {
    const pluginDir = path.join(this.configDir, 'plugins', 'octo-poa');
    if (!fs.existsSync(pluginDir)) {
      fs.mkdirSync(pluginDir, { recursive: true });
    }

    const pluginManifest = {
      name: 'octo-poa',
      version: '0.1.0',
      description: 'Octo-POA integration for OpenAI Codex',
      commands: path.join(this.configDir, 'commands', 'octo.toml')
    };

    fs.writeFileSync(
      path.join(pluginDir, 'plugin.json'),
      JSON.stringify(pluginManifest, null, 2)
    );
  }

  async uninstall() {
    const dirs = [
      path.join(this.configDir, 'commands'),
      path.join(this.configDir, 'plugins', 'octo-poa')
    ];

    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
      }
    }

    return { success: true, message: 'OpenAI Codex adapter uninstalled' };
  }
}

module.exports = CodexAdapter;
