# Octo-POA Design Document

**Parallel Operating Agent - Octopus**

A unified CLI-agnostic platform that combines planning, execution, memory, and knowledge into a single tool, with a gateway layer connecting to external automation and routing tools.

---

## 1. Vision

Octo-POA is a **4-core-module platform** with a **gateway middleware layer** that connects to external tools for routing and automation.

**Core Modules:**
- Planning & Specification
- Execution & Code Generation
- Memory & Context Management
- Knowledge Retrieval & Analysis

**Gateway Connections:**
- LLM Routing
- Workflow Automation
- Multi-Agent Orchestration
- Personal Assistant Integration

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
│  ├── LLM Router (multi-provider routing, fallback)            │
│  ├── Workflow Automation (trigger external workflows)         │
│  ├── Multi-Agent Orchestration (coordinate agents)            │
│  └── Personal Assistant (messaging platforms)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules

### 3.1 Planning Module (`lib/planner/`)

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

**Purpose:** Minimize output tokens and code generation

**Components:**
- `compress.js` — Output compression (6 intensity levels)
- `yagni.js` — YAGNI 6-rung decision ladder

**Compression Levels:**
1. `lite` — Minimal compression (preserve readability)
2. `full` — Balanced compression (default)
3. `ultra` — Maximum compression (token-optimized)

**YAGNI Ladder:**
```
1. Does this need to exist?
2. Can stdlib do it?
3. Can native platform do it?
4. Is it already installed?
5. Can it be one line?
6. Only then: minimum viable implementation
```

### 3.3 Memory Module (`lib/memory/`)

**Purpose:** Persistent cross-session memory

**Components:**
- `store.js` — SQLite storage with FTS5
- `search.js` — Hybrid search (BM25 + TF-IDF + vector)
- `consolidation.js` — 4-tier memory consolidation
- `handoff.js` — Cross-session context transfer
- `dedup.js` — SHA-256 deduplication

**Memory Tiers:**
1. Working Memory — Current session context
2. Episodic Memory — Session summaries
3. Semantic Memory — Persistent facts and knowledge
4. Procedural Memory — Learned patterns and workflows

**Search Features:**
- Reciprocal Rank Fusion (RRF)
- Synonym expansion
- Context-aware re-ranking
- Ebbinghaus decay for memory relevance

### 3.4 Knowledge Module (`lib/knowledge/`)

**Purpose:** AST parsing and knowledge graph construction

**Components:**
- `ast.js` — Multi-language AST parsing
- `graph.js` — Graph construction and management
- `compress.js` — Context compression pipeline
- `cache.js` — Compress-Cache-Retrieve (CCR)
- `query.js` — Graph query engine

**Graph Features:**
- Node types: File, Function, Class, Module, Session, Decision
- Edge types: DEPENDS_ON, CALLS, EXPORTS, IMPORTS
- Leiden community detection for clustering
- SHA256 caching for incremental updates
- Interactive HTML visualization

**Compression Pipeline:**
- SmartCrusher (JSON compression)
- CodeCompressor (AST-based)
- ContentRouter (auto-detection)
- CCR (reversible compression with retrieval)

### 3.5 Workflow Engine (`lib/workflow/`)

**Purpose:** 4-phase execution quality enforcement

**Phases:**
1. Planning — Analysis, todo list, user sign-off
2. Execution — Incremental progress, simplicity focus
3. Security — Audit, syntax check, vulnerability scan
4. Documentation — Walkthrough, persistence, review

**Phase Gates:**
- Must complete each phase before moving to next
- Planning requires explicit user sign-off
- Auto-generated templates for each workflow
- Persistent change log for crash recovery

---

## 4. Gateway Layer

### 4.1 Gateway Core (`lib/gateway/`)

**Purpose:** Connect to external tools and services

**Components:**
- `index.js` — Gateway entry point
- `translator.js` — Protocol translation (MCP ↔ REST ↔ CLI)
- `router.js` — Request routing and fallback
- `automation.js` — Workflow execution engine

### 4.2 External Connections

**LLM Router:**
- Multi-provider routing (OpenAI, Anthropic, Google, etc.)
- Fallback chain management
- Cost optimization
- Token usage tracking

**Workflow Automation:**
- Trigger external workflows
- Webhook management
- Execution monitoring
- Result collection

**Multi-Agent Orchestration:**
- Crew creation and execution
- Status monitoring
- Result collection
- Inter-agent communication

**Personal Assistant:**
- Message sending
- Channel management
- Session status
- Platform integration

### 4.3 Protocol Translators

**MCP Protocol:**
- JSON-RPC 2.0 over stdin/stdout
- Tool discovery and invocation
- Resource management

**REST Protocol:**
- HTTP/HTTPS requests
- Authentication handling
- Response parsing

**CLI Protocol:**
- Shell command execution
- Output capture
- Error handling

---

## 5. Agent Adapters

### 5.1 Supported Agents

- **Claude Code** — Anthropic's CLI agent
- **OpenAI Codex** — OpenAI's CLI agent
- **Gemini CLI** — Google's CLI agent
- **Cursor** — AI-powered code editor
- **Generic** — Any CLI agent (MiMo, FreeBuff, Antigravity, JCode, OpenCode, etc.)

### 5.2 Adapter Pattern

Each adapter provides:
- Installation script
- Configuration template
- Hook integration
- MCP server connection

---

## 6. Data Storage

### 6.1 SQLite Store

**Tables:**
- `sessions` — Session metadata and context
- `observations` — Memory observations
- `facts` — Semantic memory facts
- `graph_nodes` — Knowledge graph nodes
- `graph_edges` — Knowledge graph edges
- `tokens` — Token usage tracking
- `plans` — Implementation plans
- `workflows` — Workflow state

**Features:**
- WAL mode for concurrent reads
- FTS5 for full-text search
- SHA256 content hashing
- Automatic migrations

### 6.2 File-Based Storage

**Directory Structure:**
```
.octo/
├── config.json          # Project configuration
├── octo.db              # SQLite database
├── tasks/               # Workflow templates
│   └── <workflow-id>/
│       ├── workflow.json
│       ├── todo.md
│       ├── steps.md
│       └── dev.md
└── sessions/            # Session data
    └── <session-id>/
        ├── CONTEXT.md
        ├── DECISIONS.md
        ├── PROGRESS.md
        └── ISSUES.md
```

---

## 7. Token Optimization

### 7.1 Strategy

**Target:** 80% reduction (from 90% to 20%)

**Techniques:**
1. **Deduplication** — Remove repeated content
2. **Summarization** — Replace verbose text with concise summaries
3. **AST Compression** — Strip comments, blank lines, unnecessary braces
4. **Cache Alignment** — Stabilize prefixes for KV cache hits
5. **Context Compression** — Compress large tool outputs and logs

### 7.2 Tracking

- Per-session token usage
- Budget management
- Efficiency metrics
- Cost estimation

---

## 8. Testing Strategy

### 8.1 Unit Tests

- Core engine tests
- Module tests (planner, execution, memory, knowledge)
- Gateway tests
- Workflow tests

### 8.2 Integration Tests

- End-to-end planning flow
- Cross-session continuity
- Graph accuracy
- Gateway connections

### 8.3 Performance Tests

- Token reduction benchmarks
- Memory search latency
- Graph query performance
- Gateway throughput

---

## 9. Security Considerations

### 9.1 Data Protection

- Local-first storage (no cloud dependency)
- Encrypted sensitive data
- Secure credential management
- Audit logging

### 9.2 Access Control

- Project-level permissions
- Session isolation
- Gateway authentication
- API key management

---

## 10. Future Enhancements

### 10.1 Planned Features

- Headless proxy mode
- Agent-specific skill generation
- Watch mode for auto-scanning
- Git hook integration
- Obsidian vault integration
- Cross-agent memory sharing
- Output token reduction
- Workflow templates
- Plan templates
- Graph query language
- Token optimization rules engine
- Session compaction
- Multi-project support
- Web dashboard
- API endpoints

---

## Appendix A: Configuration

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

---

## Appendix B: CLI Commands

### Core
- `octo init` — Initialize Octo-POA
- `octo config-show` — Show configuration

### Planning
- `octo plan-constitution` — Create project principles
- `octo specify <feature>` — Create feature specification
- `octo plan <feature>` — Create implementation plan

### Execution
- `octo compress <text>` — Compress output text
- `octo yagni <code>` — Evaluate YAGNI ladder

### Memory
- `octo remember <observation>` — Store observation
- `octo recall <query>` — Search memory

### Knowledge
- `octo graph-scan` — Scan codebase
- `octo query <question>` — Query knowledge graph

### Workflow
- `octo workflow-start <name> <desc>` — Start workflow
- `octo workflow-list` — List workflows
- `octo workflow-status <id>` — Get status
- `octo workflow-check <id> <phase>` — Check phase gate
- `octo workflow-complete <id> <phase>` — Complete phase
- `octo workflow-todo <id> <item>` — Add todo item
- `octo workflow-steps <id> <section> <content>` — Update steps

### Gateway
- `octo gateway-status` — Check connections

### Integrations
- `octo install <agent>` — Install adapter
- `octo uninstall <agent>` — Uninstall adapter
- `octo list-agents` — List adapters
