const fs = require('fs');
const path = require('path');

class GenericAdapter {
  constructor(engine, agentName = 'generic') {
    this.engine = engine;
    this.name = agentName;
    this.projectPath = engine?.projectPath || process.cwd();
  }

  async install() {
    await this.installInstructions();
    await this.installCommands();

    return { success: true, message: `Generic adapter installed for ${this.name}` };
  }

  async installInstructions() {
    const instructions = `# Octo-POA Integration for ${this.name}

## Available Commands

### Planning
- \`octo init\` - Initialize Octo-POA in project
- \`octo plan-constitution\` - Create project principles
- \`octo specify <feature>\` - Create feature specification
- \`octo plan <feature>\` - Create implementation plan

### Execution
- \`octo compress <text>\` - Compress output (caveman-style)
- \`octo yagni <code>\` - Evaluate YAGNI ladder

### Memory
- \`octo remember <observation>\` - Store observation
- \`octo recall <query>\` - Search memory
- \`octo context\` - Get session context

### Knowledge
- \`octo graph-scan\` - Scan codebase
- \`octo query <question>\` - Query knowledge graph
- \`octo compress-context <content>\` - Compress context

### Gateway
- \`octo gateway-status\` - Check external connections
- \`octo route <tool> <request>\` - Route to external tool

## Workflow Integration

### Before Starting Work
1. Check memory: \`octo recall <topic>\`
2. Query graph: \`octo query "relevant files"\`
3. Load context: \`octo context\`

### During Work
1. Store decisions: \`octo remember "Decision: <what> because <why>"\`
2. Log bugs: \`octo remember "Bug: <description>"\`
3. Record lessons: \`octo remember "Lesson: <insight>"\`

### After Completing Work
1. Scan codebase: \`octo graph-scan\`
2. Store completion: \`octo remember "Completed: <what>"\`
3. Update context: \`octo context\`

## Token Optimization

### Compress Output
Enable compression for token savings:
\`\`\`
octo compress "Your long response here"
\`\`\`

### Use Knowledge Graph
Instead of reading files, query the graph:
\`\`\`
octo query "dependencies of src/api.js"
octo query "unused functions"
octo query "token-heavy files"
\`\`\`

### Memory Over Re-explanation
Search memory before re-explaining:
\`\`\`
octo recall "authentication setup"
octo recall "database schema"
\`\`\`

## Gateway Integration

### Check Connections
\`\`\`
octo gateway-status
\`\`\`

### Route to External Tools
\`\`\`
octo route n8n '{"workflowId": "123", "data": {...}}'
octo route crewai '{"agents": [...], "tasks": [...]}'
\`\`\`
`;

    const instructionsPath = path.join(this.projectPath, '.octo', `${this.name}-instructions.md`);
    fs.writeFileSync(instructionsPath, instructions);
  }

  async installCommands() {
    const commands = `#!/bin/bash
# Octo-POA commands for ${this.name}

case "$1" in
  "init")
    octo init
    ;;
  "constitution")
    octo plan-constitution
    ;;
  "specify")
    octo specify "$2"
    ;;
  "compress")
    octo compress "$2"
    ;;
  "remember")
    octo remember "$2"
    ;;
  "recall")
    octo recall "$2"
    ;;
  "scan")
    octo graph-scan
    ;;
  "query")
    octo query "$2"
    ;;
  "status")
    octo gateway-status
    ;;
  *)
    echo "Usage: octo-commands <command> [args]"
    echo "Commands: init, constitution, specify, compress, remember, recall, scan, query, status"
    ;;
esac
`;

    const commandsPath = path.join(this.projectPath, '.octo', 'octo-commands.sh');
    fs.writeFileSync(commandsPath, commands);

    try {
      fs.chmodSync(commandsPath, '755');
    } catch (e) {
      // Silent fail on chmod
    }
  }

  async uninstall() {
    const files = [
      path.join(this.projectPath, '.octo', `${this.name}-instructions.md`),
      path.join(this.projectPath, '.octo', 'octo-commands.sh')
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }

    return { success: true, message: `Generic adapter uninstalled for ${this.name}` };
  }
}

module.exports = GenericAdapter;
