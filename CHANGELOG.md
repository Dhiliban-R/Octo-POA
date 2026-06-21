# Changelog

All notable changes to Octo-POA will be documented in this file.

## [1.0.0] - 2026-06-20

### Added

#### Core Platform
- CLI entry point (`bin/octo.js`) with all commands
- Main library exports (`lib/index.js`)
- Package configuration (`package.json`)

#### Planning Engine (`lib/planner/`)
- Product plan creation with structured phases (Discovery → Design → Implementation → Testing → Deployment)
- BRIEF.md template for product requirements
- DESIGN.md template for architecture specs
- TASKS.md template with checkbox-based task tracking
- PROGRESS.json for phase-based progress tracking
- Plan status and summary commands

#### Token Optimizer (`lib/optimizer/`)
- Token calculation engine
- Context deduplication (removes repeated content)
- Smart summarization (replaces verbose content with concise summaries)
- AST-based code compression (strips comments, blank lines, unnecessary braces)
- Token usage tracking and recording
- Token budget management
- Code analysis with savings estimation

#### Context Graph (`lib/graph/`)
- Knowledge graph initialization and persistence
- File scanning with content hashing (SHA256)
- Function extraction via regex patterns (JavaScript, TypeScript, Python)
- Import/dependency extraction
- Graph node and edge management
- Query engine for searching files, functions, and edges
- Unused code detection
- Dependency traversal
- Interactive HTML visualization
- Statistics and metrics

#### Session Manager (`lib/session/`)
- Session creation with standardized files (CONTEXT.md, DECISIONS.md, PROGRESS.md, ISSUES.md, TOKENS.json)
- Session listing and retrieval
- Context updates
- Decision tracking with timestamps
- Progress updates
- Issue logging
- Token usage recording per session
- Session relay for cross-session context transfer

#### Workflow Engine (`lib/workflow/`)
- 4-phase execution workflow: Planning → Execution → Security → Documentation
- Phase gate enforcement: must complete each phase before moving to next
- Planning phase requires explicit user sign-off before execution begins
- Auto-generated templates: todo.md, steps.md, dev.md for each workflow
- Persistent change log (steps.md) for crash recovery
- Todo item tracking per phase
- Workflow status and progress reporting

#### CLI Commands
- `octo init` - Initialize Octo-POA
- `octo plan-constitution` - Create project principles
- `octo specify <feature>` - Create feature specification
- `octo plan <feature>` - Create implementation plan
- `octo compress <text>` - Compress output text
- `octo remember <text>` - Store observation in memory
- `octo recall <query>` - Search memory
- `octo graph-scan` - Scan codebase for knowledge graph
- `octo query <query>` - Query knowledge graph
- `octo gateway-status` - Check gateway connections
- `octo session-start` - Start new session
- `octo list-agents` - List available agent adapters
- `octo install <agent>` - Install agent adapter
- `octo workflow-start <name> <desc>` - Start execution workflow
- `octo workflow-list` - List all workflows
- `octo workflow-status <id>` - Get workflow status
- `octo workflow-check <id> <phase>` - Check phase gate
- `octo workflow-complete <id> <phase>` - Complete phase
- `octo workflow-todo <id> <item>` - Add todo item
- `octo workflow-steps <id> <section> <content>` - Update steps log
- `octo config-show` - Show configuration
- `octo help` - Show help

#### MCP Tools
- `octo_constitution` - Create project principles
- `octo_specify` - Create feature specification
- `octo_plan` - Create implementation plan
- `octo_compress` - Compress output text
- `octo_remember` - Store observation in memory
- `octo_recall` - Search memory
- `octo_scan` - Scan codebase for knowledge graph
- `octo_graph_query` - Query knowledge graph
- `octo_compress_context` - Compress context
- `octo_gateway_status` - Check gateway connections
- `octo_route` - Route request to external tool
- `octo_workflow_start` - Start execution workflow
- `octo_workflow_list` - List all workflows
- `octo_workflow_status` - Get workflow status
- `octo_workflow_complete` - Complete phase
- `octo_workflow_check` - Check phase gate
- `octo_workflow_todo` - Add todo item
- `octo_workflow_steps` - Update steps log

#### Tests
- 43 passing tests (6 unit tests + 37 integration tests)
- Test coverage for all modules: core, planning, execution, memory, knowledge, gateway, workflow
- Performance benchmarks for CLI startup, compression, memory operations, and workflow

#### Documentation
- README.md with full documentation
- DESIGN.md with architecture and design decisions
- LICENSE (MIT)
- .gitignore

### Architecture
- CLI-agnostic design (works with MiMoCode, Gemini CLI, Claude Code, FreeBuff)
- File-based persistence (`.octo/` directory structure)
- Modular library architecture (planner, optimizer, graph, session, workflow)
- No external dependencies (pure Node.js)

### Token Optimization Strategy
- Target: 80% reduction (from 90% to 20%)
- Techniques: Deduplication, summarization, AST compression, cache alignment
- Tracking: Per-session token usage, budget management, efficiency metrics

### Context Graph Features
- Tree-sitter style AST parsing (regex-based)
- Session-aware queries
- Dependency tracking
- Unused code detection
- HTML visualization

## [Unreleased]

### Planned

#### Research & Integration (2026-06-20)
- **Graphify Integration** - Knowledge graph for codebases
  - Source: github.com/safishamsi/graphify (69.8k stars)
  - Tree-sitter AST parsing for 36+ languages
  - Leiden community detection for clustering
  - Confidence tags: EXTRACTED, INFERRED, AMBIGUOUS
  - Query: `graphify query "what connects X to Y?"`
  - Auto-rebuild on git commit via hooks
  - Obsidian vault export support
  
- **Headroom Integration** - Token compression (60-95% reduction)
  - Source: github.com/chopratejas/headroom (41.2k stars)
  - 6 algorithms: SmartCrusher, CodeCompressor, Kompress-base, CacheAligner, CCR, IntelligentContext
  - Proxy mode: zero code changes
  - Cross-agent memory sharing
  - `headroom learn` for failure mining
  - Output token reduction (not just input)
  
- **Ponytail Integration** - Minimal code generation
  - Source: github.com/DietrichGebert/ponytail (42.5k stars)
  - YAGNI-first approach: "Does this need to exist?"
  - Ladder: stdlib → native platform → installed dependency → one line → minimum
  - ~54% less code, ~20% cheaper, ~27% faster
  - Safety preserved: validation, security, accessibility never cut

#### Architecture Enhancements
- MCP server with 20+ tools (planning, execution, memory, knowledge, gateway, workflow)
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
