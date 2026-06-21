# Octo-POA Design Document v2

**Parallel Operating Agent - Octopus**

A unified CLI-agnostic platform that combines planning, execution, memory, and knowledge into a single tool, with a gateway layer connecting to external automation and routing tools.

---

## 1. Vision

Octo-POA is a **4-core-module platform** with a **gateway middleware layer** that connects to external tools for routing and automation.

**What we build (Categories 1-4):**
- Planning & Specification (from spec-kit)
- Execution & Code Generation (from caveman + ponytail)
- Memory & Context Management (from claude-mem-lite + agentmemory + graphiti)
- Knowledge Retrieval & Analysis (from graphify + headroom)

**What we connect to (Categories 5-6):**
- LLM Routing (9router) — via gateway
- Workflow Automation (n8n) — via gateway
- Multi-Agent Orchestration (crewAI) — via gateway
- Personal Assistant (openclaw) — via gateway

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        OCTO-POA CLI                             │
│  Single entry point: `octo`                                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                     CORE ENGINE                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Planning │ │Execution │ │  Memory  │ │Knowledge │          │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │            │            │            │                  │
│  ┌────▼────────────▼────────────▼────────────▼────┐            │
│  │              Shared SQLite Store                │            │
│  │  (sessions, graph, tokens, plans, memory)      │            │
│  └────────────────────────────────────────────────┘            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   GATEWAY LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Protocol Translator  │  Router  │  Automation Engine   │   │
│  │  (MCP ↔ REST ↔ CLI)  │          │  (Workflow Runner)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Connections:                                                   │
│  ├── 9router (LLM routing, fallback, cost optimization)       │
│  ├── n8n (workflow automation, 400+ integrations)             │
│  ├── crewAI (multi-agent orchestration)                       │
│  └── openclaw (personal assistant, 24+ platforms)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules (What We Build)

### 3.1 Planning Module (`lib/planner/`)

**Source inspiration:** spec-kit (114k stars)

**Purpose:** Spec-Driven Development workflow

**Components:**
- `constitution.js` — Project principles (9 Articles)
- `spec.js` — Feature specification generator
- `plan.js` — Implementation plan creator
- `tasks.js` — Task breakdown with dependencies
- `workflow.js` — Pipeline orchestration engine

**Workflow:**
```
Constitution → Specify → Plan → Tasks → Implement
```

**Key Features:**
- Constitutional architecture (immutable principles)
- Template-driven LLM constraint
- State persistence after every step
- Human review gates
- Fan-out/fan-in parallel execution

### 3.2 Execution Module (`lib/execution/`)

**Source inspiration:** caveman (75.2k stars) + ponytail (43.7k stars)

**Purpose:** Minimize output tokens and code generation

**Components:**
- `compress.js` — Output compression (6 intensity levels)
- `yagni.js` — YAGNI 6-rung decision ladder
- `hooks.js` — Session lifecycle hooks
- `subagents.js` — Compressed subagent delegation

**Caveman Compression Levels:**
| Level | Behavior |
|-------|----------|
| lite | Drop filler, keep articles |
| full | Compressed prose (default) |
| ultra | Telegraphic, strip conjunctions |
| wenyan-lite | Classical Chinese lite |
| wenyan-full | Classical Chinese full |
| wenyan-ultra | Classical Chinese ultra |

**Ponytail YAGNI Ladder:**
```
1. Does this need to exist?    → no: skip
2. Stdlib does it?             → use it
3. Native platform feature?    → use it
4. Installed dependency?       → use it
5. One line?                   → one line
6. Only then: minimum that works
```

**Safety Rules (NEVER simplified):**
- Input validation at trust boundaries
- Error handling preventing data loss
- Security measures
- Accessibility basics
- Hardware calibration

### 3.3 Memory Module (`lib/memory/`)

**Source inspiration:** claude-mem-lite + agentmemory + graphiti

**Purpose:** Persistent cross-session memory

**Components:**
- `store.js` — SQLite persistent store
- `search.js` — Hybrid FTS5 + TF-IDF + vector search
- `consolidation.js` — 4-tier memory lifecycle
- `handoff.js` — Cross-session relay
- `dedup.js` — SHA-256 deduplication

**4-Tier Memory Consolidation:**
| Tier | What | Analogy |
|------|------|---------|
| Working | Raw observations | Short-term memory |
| Episodic | Compressed session summaries | "What happened" |
| Semantic | Extracted facts and patterns | "What I know" |
| Procedural | Workflows and decision patterns | "How to do it" |

**Search Pipeline:**
```
Query → FTS5 BM25 → TF-IDF Vector → Knowledge Graph → RRF Fusion → Results
```

**Memory Lifecycle:**
- Ebbinghaus decay (memories fade over time)
- Citation-reinforcement (frequently accessed memories strengthen)
- Auto-forgetting (stale memories auto-evict)
- Contradiction detection (old facts invalidated, not deleted)

### 3.4 Knowledge Module (`lib/knowledge/`)

**Source inspiration:** graphify (69.9k stars) + headroom (42.1k stars)

**Purpose:** Codebase understanding and context compression

**Components:**
- `ast.js` — Tree-sitter AST parsing (36+ languages)
- `graph.js` — Knowledge graph construction
- `compress.js` — Context compression pipeline
- `cache.js` — Reversible compression (CCR)
- `query.js` — Graph query engine

**AST Parsing:**
- Languages: Python, JavaScript, TypeScript, Go, Rust, Java, C/C++, Ruby, Kotlin, Scala, PHP, Swift, Lua, Zig, Fortran, Pascal, and more
- Extracts: functions, classes, imports, exports, calls, comments
- Parallel execution via worker threads

**Knowledge Graph:**
- Nodes: File, Function, Class, Module, Session, Decision
- Edges: DEPENDS_ON, CALLS, EXPORTS, IMPORTS, ACCESSED_BY, DECIDED_IN
- Leiden community detection for clustering
- Incremental updates (no batch recomputation)

**Compression Pipeline (from headroom):**
```
Input → ContentRouter → SmartCrusher (JSON) → CodeCompressor (AST) → CCR Store → Output
```

**Compression Strategies:**
| Content Type | Compressor | Savings |
|--------------|------------|---------|
| JSON arrays | SmartCrusher | 70-90% |
| Source code | CodeCompressor | 40-70% |
| Search results | SearchCompressor | 80-95% |
| Build logs | LogCompressor | 85-95% |
| Diffs | DiffCompressor | 60-80% |

**CCR (Compress-Cache-Retrieve):**
- Nothing is thrown away
- Compressed content stored locally
- LLM can retrieve originals on demand
- Reversible compression eliminates data loss risk

---

## 4. Gateway Layer (What We Connect To)

### 4.1 Gateway Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GATEWAY LAYER                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Protocol Translator                      │   │
│  │  Input: MCP, REST, CLI, WebSocket                       │   │
│  │  Output: MCP, REST, CLI, WebSocket                      │   │
│  │  Converts between formats bidirectionally               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Router                                │   │
│  │  Routes requests to appropriate external tool           │   │
│  │  Handles fallback, retry, load balancing                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Automation Engine                          │   │
│  │  Executes workflows across external tools               │   │
│  │  Manages state, progress, error recovery                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  External Connections:                                          │
│  ├── 9router (http://localhost:20128/v1)                      │
│  ├── n8n (http://localhost:5678/api/v1)                       │
│  ├── crewAI (Python subprocess)                               │
│  └── openclaw (WebSocket)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 9router Integration (LLM Routing)

**Connection:** HTTP proxy at `localhost:20128/v1`

**Purpose:**
- Route LLM requests to 40+ providers
- Smart fallback (Subscription → Cheap → Free)
- Token compression via RTK
- Cost optimization

**Gateway Interface:**
```javascript
class RouterGateway {
  constructor(config) {
    this.baseUrl = config.routerUrl || 'http://localhost:20128/v1';
    this.fallbackChain = config.fallbackChain || ['anthropic', 'openai', 'gemini'];
  }

  async routeRequest(request) {
    // 1. Check if 9router is running
    // 2. Forward request with format translation
    // 3. Handle fallback on failure
    // 4. Track usage and cost
  }

  async getProviders() {
    // List available providers and models
  }

  async getUsage() {
    // Get token usage and cost tracking
  }
}
```

### 4.3 n8n Integration (Workflow Automation)

**Connection:** REST API at `localhost:5678/api/v1`

**Purpose:**
- Execute complex workflows
- Connect to 400+ services
- Visual workflow editor
- Webhook triggers

**Gateway Interface:**
```javascript
class AutomationGateway {
  constructor(config) {
    this.baseUrl = config.n8nUrl || 'http://localhost:5678/api/v1';
    this.apiKey = config.n8nApiKey;
  }

  async triggerWorkflow(workflowId, data) {
    // Trigger n8n workflow with data
  }

  async createWebhook(workflowId) {
    // Create webhook for Octo-POA events
  }

  async getWorkflows() {
    // List available workflows
  }

  async getExecutions(workflowId) {
    // Get workflow execution history
  }
}
```

### 4.4 crewAI Integration (Multi-Agent Orchestration)

**Connection:** Python subprocess or REST API

**Purpose:**
- Multi-agent task decomposition
- Role-based agent collaboration
- Sequential/hierarchical execution
- Memory and knowledge sharing

**Gateway Interface:**
```javascript
class OrchestrationGateway {
  constructor(config) {
    this.pythonPath = config.pythonPath || 'python3';
    this.crewaiPath = config.crewaiPath || 'crewai';
  }

  async createCrew(agents, tasks) {
    // Create crew with agents and tasks
  }

  async kickoffCrew(crewId, inputs) {
    // Execute crew
  }

  async getCrewStatus(crewId) {
    // Get crew execution status
  }
}
```

### 4.5 openclaw Integration (Personal Assistant)

**Connection:** WebSocket or REST API

**Purpose:**
- Multi-platform messaging
- Voice capabilities
- Always-on daemon
- Personal assistant features

**Gateway Interface:**
```javascript
class AssistantGateway {
  constructor(config) {
    this.wsUrl = config.openclawWs || 'ws://localhost:18789';
    this.restUrl = config.openclawRest || 'http://localhost:18789';
  }

  async sendMessage(channel, message) {
    // Send message via openclaw
  }

  async getChannels() {
    // List available channels
  }

  async getSessionStatus() {
    // Get openclaw session status
  }
}
```

---

## 5. Data Flow

### 5.1 Planning → Execution → Memory Flow

```
User Request
     │
     ▼
┌─────────────┐
│  Planning   │ Create spec, plan, tasks
│  Module     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Execution  │ Generate code with YAGNI
│  Module     │ Compress output with caveman
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Memory     │ Store observations
│  Module     │ Update knowledge graph
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Knowledge  │ Update AST graph
│  Module     │ Compress context
└──────┬──────┘
       │
       ▼
  .octo/ directory updated
```

### 5.2 Gateway Routing Flow

```
Octo-POA Core Request
     │
     ▼
┌─────────────┐
│  Gateway    │ Determine which external tool to use
│  Router     │
└──────┬──────┘
       │
       ├─── LLM Request ──→ 9router ──→ Provider
       │
       ├─── Workflow ──→ n8n ──→ Integration
       │
       ├─── Multi-Agent ──→ crewAI ──→ Agents
       │
       └─── Message ──→ openclaw ──→ Platform
```

---

## 6. File Structure

```
octo-poa/
├── bin/
│   └── octo.js                    # CLI entry point
│
├── lib/
│   ├── core/
│   │   ├── engine.js              # Main orchestrator
│   │   ├── config.js              # Configuration manager
│   │   ├── store.js               # SQLite store
│   │   └── logger.js              # Logging system
│   │
│   ├── planner/                   # Planning Module
│   │   ├── index.js               # Module entry
│   │   ├── constitution.js        # Project principles
│   │   ├── spec.js                # Specification generator
│   │   ├── plan.js                # Implementation plan
│   │   ├── tasks.js               # Task breakdown
│   │   └── workflow.js            # Pipeline engine
│   │
│   ├── execution/                 # Execution Module
│   │   ├── index.js               # Module entry
│   │   ├── compress.js            # Output compression (caveman)
│   │   ├── yagni.js               # YAGNI ladder (ponytail)
│   │   ├── hooks.js               # Session hooks
│   │   └── subagents.js           # Subagent delegation
│   │
│   ├── memory/                    # Memory Module
│   │   ├── index.js               # Module entry
│   │   ├── store.js               # SQLite store
│   │   ├── search.js              # Hybrid search
│   │   ├── consolidation.js       # 4-tier lifecycle
│   │   ├── handoff.js             # Cross-session relay
│   │   └── dedup.js               # Deduplication
│   │
│   ├── knowledge/                 # Knowledge Module
│   │   ├── index.js               # Module entry
│   │   ├── ast.js                 # Tree-sitter parsing
│   │   ├── graph.js               # Knowledge graph
│   │   ├── compress.js            # Context compression
│   │   ├── cache.js               # CCR (reversible)
│   │   └── query.js               # Graph queries
│   │
│   └── gateway/                   # Gateway Layer
│       ├── index.js               # Gateway entry
│       ├── translator.js          # Protocol translator
│       ├── router.js              # Request routing
│       ├── automation.js          # Workflow execution
│       │
│       ├── connections/
│       │   ├── router.js          # 9router connection
│       │   ├── n8n.js             # n8n connection
│       │   ├── crewai.js          # crewAI connection
│       │   └── openclaw.js        # openclaw connection
│       │
│       └── protocols/
│           ├── mcp.js             # MCP protocol
│           ├── rest.js            # REST protocol
│           └── cli.js             # CLI protocol
│
├── integrations/                  # Agent Adapters
│   ├── claude.js                  # Claude Code
│   ├── codex.js                   # OpenAI Codex
│   ├── gemini.js                  # Gemini CLI
│   ├── cursor.js                  # Cursor
│   └── generic.js                 # Generic agent
│
├── mcp/
│   └── server.js                  # MCP server
│
├── tests/                         # Test suite
│
├── docs/                          # Documentation
│
├── DESIGN.md                      # This file
├── PLAN.md                        # Implementation plan
├── TODO.md                        # Task tracker
├── CHANGELOG.md                   # Change log
├── package.json                   # Package config
└── LICENSE                        # MIT license
```

---

## 7. MCP Server

The MCP server exposes all Octo-POA capabilities as tools:

**Planning Tools:**
- `octo_constitution` — Create project principles
- `octo_specify` — Create feature specification
- `octo_plan` — Create implementation plan
- `octo_tasks` — Generate task breakdown

**Execution Tools:**
- `octo_compress` — Compress output text
- `octo_yagni` — Evaluate YAGNI ladder

**Memory Tools:**
- `octo_remember` — Store observation
- `octo_recall` — Search memory
- `octo_context` — Get session context

**Knowledge Tools:**
- `octo_scan` — Scan codebase
- `octo_graph` — Query knowledge graph
- `octo_compress_context` — Compress context

**Gateway Tools:**
- `octo_route` — Route to external tool
- `octo_workflow` — Trigger n8n workflow
- `octo_crew` — Create crewAI crew
- `octo_message` — Send via openclaw

---

## 8. Configuration

### 8.1 Global Config (`~/.octo-poa/config.json`)

```json
{
  "version": "1.0.0",
  "core": {
    "compressionLevel": "full",
    "yagniLevel": "full",
    "memoryBudget": 2000,
    "knowledgeEnabled": true
  },
  "gateway": {
    "router": {
      "enabled": true,
      "url": "http://localhost:20128/v1",
      "fallbackChain": ["anthropic", "openai", "gemini"]
    },
    "n8n": {
      "enabled": false,
      "url": "http://localhost:5678/api/v1",
      "apiKey": ""
    },
    "crewai": {
      "enabled": false,
      "pythonPath": "python3"
    },
    "openclaw": {
      "enabled": false,
      "wsUrl": "ws://localhost:18789"
    }
  },
  "agents": {
    "defaultAgent": "claude",
    "agents": {
      "claude": { "enabled": true },
      "codex": { "enabled": false },
      "gemini": { "enabled": false }
    }
  }
}
```

### 8.2 Project Config (`.octo/config.json`)

```json
{
  "constitution": {
    "principles": [
      "Library-First: Every feature starts as standalone library",
      "CLI Interface: Every library exposes text-based I/O",
      "Test-First: No code before tests",
      "Simplicity Gate: Max 3 projects for initial implementation"
    ]
  },
  "compression": {
    "level": "full",
    "preserveCode": true,
    "preserveErrors": true
  },
  "memory": {
    "enabled": true,
    "autoCapture": true,
    "consolidationInterval": 7200000
  }
}
```

---

## 9. CLI Commands

```bash
# Planning
octo init                          # Initialize Octo-POA in project
octo plan constitution             # Create project principles
octo plan specify "feature"        # Create feature specification
octo plan design                   # Generate implementation plan
octo plan tasks                    # Generate task breakdown
octo plan status                   # Show plan status

# Execution
octo compress <text>               # Compress output
octo yagni <code>                  # Evaluate YAGNI ladder
octo review <diff>                 # Review code for over-engineering

# Memory
octo memory remember "observation" # Store observation
octo memory recall "query"         # Search memory
octo memory context                # Get session context
octo memory stats                  # Memory statistics

# Knowledge
octo graph scan                    # Scan codebase
octo graph query "find unused"     # Query knowledge graph
octo graph visualize               # Open graph visualization
octo graph compress                # Compress context

# Gateway
octo gateway status                # Check external tool connections
octo gateway route <request>       # Route to external tool
octo gateway workflow <id>         # Trigger n8n workflow
octo gateway crew <config>         # Create crewAI crew

# Session
octo session start                 # Start new session
octo session resume                # Resume previous session
octo session save                  # Save current session
octo session list                  # List sessions

# Config
octo config show                   # Show configuration
octo config set <key> <value>      # Set configuration
octo config gateway                # Configure gateway connections
```

---

## 10. Success Metrics

| Metric | Target | Source |
|--------|--------|--------|
| Token reduction | 80% | headroom + caveman |
| Code reduction | 50% | ponytail |
| Memory recall accuracy | 95% | claude-mem-lite + agentmemory |
| Graph query latency | <500ms | graphify |
| Session continuity | 100% | memory module |
| Cross-agent support | 10+ agents | integration adapters |
| External tool uptime | 99% | gateway layer |

---

## 11. Implementation Phases

### Phase 1: Core Foundation (Week 1-2)
- Core engine, config, SQLite store
- CLI entry point
- Basic module structure

### Phase 2: Planning Module (Week 2-3)
- Constitution engine
- Specification generator
- Plan creator
- Task breakdown

### Phase 3: Execution Module (Week 3-4)
- Output compression (caveman)
- YAGNI ladder (ponytail)
- Session hooks
- Subagent delegation

### Phase 4: Memory Module (Week 4-5)
- SQLite store
- Hybrid search
- 4-tier consolidation
- Cross-session handoff

### Phase 5: Knowledge Module (Week 5-6)
- Tree-sitter AST parsing
- Knowledge graph construction
- Context compression
- CCR (reversible compression)

### Phase 6: Gateway Layer (Week 6-7)
- Protocol translator
- Router
- 9router connection
- n8n connection

### Phase 7: Integrations (Week 7-8)
- Agent adapters (Claude, Codex, Gemini, etc.)
- MCP server
- Automation engine

### Phase 8: Testing & Polish (Week 8-9)
- Unit tests
- Integration tests
- Performance benchmarks
- Documentation

### Phase 9: Production (Week 9-10)
- npm packaging
- CLI distribution
- Documentation site
- Community support

---

**Status:** Architecture designed, ready for implementation
**Next Step:** Begin Phase 1 — Core Foundation
