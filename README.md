# Octo-POA

**Parallel Operating Agent - Octopus**

A unified CLI-agnostic platform for AI coding agents with planning, execution, memory, knowledge, and gateway integration.

## Features

### Core Modules

| Module | What It Does |
|--------|--------------|
| **Planning** | Spec-Driven Development workflow with constitutional principles |
| **Execution** | Output compression and YAGNI code generation |
| **Memory** | Persistent cross-session memory with hybrid search |
| **Knowledge** | AST parsing and knowledge graph construction |
| **Workflow** | 4-phase execution gates with quality enforcement |

### Gateway Layer

Connect to external tools and services:

- **LLM Routing** — Multi-provider routing with fallback chains
- **Workflow Automation** — Trigger external workflows and automations
- **Multi-Agent Orchestration** — Coordinate multiple AI agents
- **Personal Assistant** — Connect to messaging platforms and channels

### Agent Adapters

Works with ANY CLI agent:

- Claude Code
- OpenAI Codex
- Gemini CLI
- Cursor
- Generic (MiMo, FreeBuff, Antigravity, JCode, OpenCode, etc.)

## Installation

```bash
npm install -g octo-poa
```

## Quick Start

```bash
# Initialize in your project
octo init

# Start a workflow
octo workflow-start "Auth System" "Build user authentication"

# Check phase gate
octo workflow-check <workflow-id> execution

# Complete planning with sign-off
octo workflow-complete <workflow-id> planning --signoff

# Store observations in memory
octo remember "Using JWT for authentication"

# Search memory
octo recall "authentication"

# Compress output
octo compress "Sure! I would be happy to help you with that."

# Scan codebase
octo graph-scan

# Query knowledge graph
octo query "find unused functions"

# Check gateway connections
octo gateway-status

# Install agent adapter
octo install claude
```

## Commands

### Core

| Command | Description |
|---------|-------------|
| `octo init` | Initialize Octo-POA in project |
| `octo config-show` | Show configuration |

### Planning

| Command | Description |
|---------|-------------|
| `octo plan-constitution` | Create project principles |
| `octo specify <feature>` | Create feature specification |
| `octo plan <feature>` | Create implementation plan |

### Execution

| Command | Description |
|---------|-------------|
| `octo compress <text>` | Compress output text |
| `octo yagni <code>` | Evaluate YAGNI ladder |

### Memory

| Command | Description |
|---------|-------------|
| `octo remember <observation>` | Store observation |
| `octo recall <query>` | Search memory |

### Knowledge

| Command | Description |
|---------|-------------|
| `octo graph-scan` | Scan codebase |
| `octo query <question>` | Query knowledge graph |

### Workflow

| Command | Description |
|---------|-------------|
| `octo workflow-start <name> <desc>` | Start workflow |
| `octo workflow-list` | List workflows |
| `octo workflow-status <id>` | Get status |
| `octo workflow-check <id> <phase>` | Check phase gate |
| `octo workflow-complete <id> <phase>` | Complete phase |
| `octo workflow-todo <id> <item>` | Add todo item |
| `octo workflow-steps <id> <section> <content>` | Update steps |

### Gateway

| Command | Description |
|---------|-------------|
| `octo gateway-status` | Check connections |

### Integrations

| Command | Description |
|---------|-------------|
| `octo install <agent>` | Install adapter |
| `octo uninstall <agent>` | Uninstall adapter |
| `octo list-agents` | List adapters |

## MCP Server

Octo-POA includes an MCP server with 20 tools:

```bash
# Start MCP server
octo-mcp <project-path>
```

### MCP Tools

- `octo_constitution` — Create principles
- `octo_specify` — Create specification
- `octo_plan` — Create plan
- `octo_compress` — Compress output
- `octo_yagni` — Evaluate YAGNI
- `octo_remember` — Store memory
- `octo_recall` — Search memory
- `octo_context` — Get context
- `octo_scan` — Scan codebase
- `octo_graph_query` — Query graph
- `octo_compress_context` — Compress context
- `octo_gateway_status` — Check connections
- `octo_route` — Route to external tool
- `octo_workflow_start` — Start workflow
- `octo_workflow_list` — List workflows
- `octo_workflow_status` — Get status
- `octo_workflow_complete` — Complete phase
- `octo_workflow_check` — Check phase gate
- `octo_workflow_todo` — Add todo
- `octo_workflow_steps` — Update steps

## Workflow Engine

The 4-phase execution workflow enforces quality:

```
Phase 1: Planning → User signs off
Phase 2: Execute → Check off items
Phase 3: Security → Audit, syntax check
Phase 4: Document → Walkthrough, persistence
```

### Phase Gates

```bash
# Can't execute without planning sign-off
$ octo workflow-check <id> execution
✗ Phase execution blocked: Previous phase (planning) not completed

# Complete planning with sign-off
$ octo workflow-complete <id> planning --signoff
✓ Phase planning completed

# Now execution is allowed
$ octo workflow-check <id> execution
✓ Phase execution allowed: Previous phase completed
```

## Configuration

### Global Config (`~/.octo-poa/config.json`)

```json
{
  "version": "0.1.0",
  "core": {
    "compressionLevel": "full",
    "yagniLevel": "full",
    "memoryBudget": 2000
  },
  "gateway": {
    "router": { "enabled": false, "url": "http://localhost:20128/v1" },
    "n8n": { "enabled": false, "url": "http://localhost:5678/api/v1" },
    "crewai": { "enabled": false },
    "openclaw": { "enabled": false }
  }
}
```

### Project Config (`.octo/config.json`)

Created automatically on `octo init`.

## Architecture

```
octo-poa/
├── bin/
│   ├── octo.js                    # CLI entry point
│   └── mcp-server.js              # MCP server
├── lib/
│   ├── core/
│   │   ├── engine.js              # Main orchestrator
│   │   ├── config.js              # Configuration
│   │   ├── store.js               # SQLite store
│   │   └── logger.js              # Logging
│   ├── planner/                   # Planning module
│   ├── execution/                 # Execution module
│   ├── memory/                    # Memory module
│   ├── knowledge/                 # Knowledge module
│   ├── workflow/                  # Workflow engine
│   └── gateway/                   # Gateway layer
├── mcp/
│   └── server.js                  # MCP server (20 tools)
├── integrations/                  # Agent adapters
│   ├── claude.js
│   ├── codex.js
│   ├── gemini.js
│   ├── cursor.js
│   └── generic.js
└── tests/
    └── integration.js             # Integration tests
```

## Development

```bash
# Clone repository
git clone https://github.com/Dhiliban-R/Octo-POA.git
cd Octo-POA

# Install dependencies
npm install

# Run tests
npm test

# Run in development
npm run dev
```

## License

MIT
