const OctoEngine = require('../lib/core/engine');

class MCPServer {
  constructor() {
    this.engine = null;
    this.tools = this.defineTools();
  }

  async init(projectPath) {
    this.engine = new OctoEngine(projectPath);
    await this.engine.init();
    return this;
  }

  defineTools() {
    return [
      // Planning Tools
      {
        name: 'octo_constitution',
        description: 'Create project principles (9 Articles of Development)',
        inputSchema: {
          type: 'object',
          properties: {
            principles: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of principles to include'
            }
          }
        }
      },
      {
        name: 'octo_specify',
        description: 'Create feature specification with user stories and requirements',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Feature description'
            }
          },
          required: ['feature']
        }
      },
      {
        name: 'octo_plan',
        description: 'Create implementation plan with phases and tasks',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Feature to plan'
            }
          },
          required: ['feature']
        }
      },

      // Execution Tools
      {
        name: 'octo_compress',
        description: 'Compress output text (caveman-style)',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to compress'
            },
            level: {
              type: 'string',
              enum: ['lite', 'full', 'ultra'],
              description: 'Compression level'
            }
          },
          required: ['text']
        }
      },
      {
        name: 'octo_yagni',
        description: 'Evaluate code against YAGNI ladder',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Code to evaluate'
            }
          },
          required: ['code']
        }
      },

      // Memory Tools
      {
        name: 'octo_remember',
        description: 'Store observation in persistent memory',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Observation to store'
            },
            type: {
              type: 'string',
              enum: ['observation', 'decision', 'bugfix', 'lesson'],
              description: 'Type of observation'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'octo_recall',
        description: 'Search memory for relevant observations',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'octo_context',
        description: 'Get session context and recent observations',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID (optional)'
            }
          }
        }
      },

      // Knowledge Tools
      {
        name: 'octo_scan',
        description: 'Scan codebase and build knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to scan (optional, defaults to current)'
            }
          }
        }
      },
      {
        name: 'octo_graph_query',
        description: 'Query knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'Question to query'
            }
          },
          required: ['question']
        }
      },
      {
        name: 'octo_compress_context',
        description: 'Compress context for token savings',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to compress'
            }
          },
          required: ['content']
        }
      },

      // Gateway Tools
      {
        name: 'octo_gateway_status',
        description: 'Check status of external tool connections',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'octo_route',
        description: 'Route request to external tool via gateway',
        inputSchema: {
          type: 'object',
          properties: {
            tool: {
              type: 'string',
              enum: ['router', 'n8n', 'crewai', 'openclaw'],
              description: 'External tool to route to'
            },
            request: {
              type: 'object',
              description: 'Request to send'
            }
          },
          required: ['tool', 'request']
        }
      },

      // Workflow Tools
      {
        name: 'octo_workflow_start',
        description: 'Start a new execution workflow with 4-phase gates',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Workflow name'
            },
            description: {
              type: 'string',
              description: 'Workflow description'
            }
          },
          required: ['name', 'description']
        }
      },
      {
        name: 'octo_workflow_list',
        description: 'List all workflows',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'octo_workflow_status',
        description: 'Get workflow status and progress',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID'
            }
          },
          required: ['workflowId']
        }
      },
      {
        name: 'octo_workflow_complete',
        description: 'Complete a workflow phase',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID'
            },
            phase: {
              type: 'string',
              enum: ['planning', 'execution', 'security', 'documentation'],
              description: 'Phase to complete'
            },
            signoff: {
              type: 'boolean',
              description: 'User sign-off (required for planning phase)'
            }
          },
          required: ['workflowId', 'phase']
        }
      },
      {
        name: 'octo_workflow_check',
        description: 'Check if a phase is allowed to proceed',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID'
            },
            phase: {
              type: 'string',
              enum: ['planning', 'execution', 'security', 'documentation'],
              description: 'Phase to check'
            }
          },
          required: ['workflowId', 'phase']
        }
      },
      {
        name: 'octo_workflow_todo',
        description: 'Add todo item to workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID'
            },
            phase: {
              type: 'string',
              enum: ['planning', 'execution', 'security', 'documentation'],
              description: 'Phase to add todo to'
            },
            item: {
              type: 'string',
              description: 'Todo item text'
            }
          },
          required: ['workflowId', 'phase', 'item']
        }
      },
      {
        name: 'octo_workflow_steps',
        description: 'Update steps log for persistence',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID'
            },
            section: {
              type: 'string',
              description: 'Section to update (Changes Made, Key Decisions, etc.)'
            },
            content: {
              type: 'string',
              description: 'Content to add'
            }
          },
          required: ['workflowId', 'section', 'content']
        }
      }
    ];
  }

  async handleToolCall(name, args) {
    if (!this.engine) {
      throw new Error('Server not initialized. Call init() first.');
    }

    switch (name) {
      // Planning
      case 'octo_constitution': {
        const planner = await this.engine.getPlanner();
        const result = await planner.createConstitution();
        return { success: true, data: result };
      }

      case 'octo_specify': {
        const planner = await this.engine.getPlanner();
        const result = await planner.createSpec(args.feature);
        return { success: true, data: result };
      }

      case 'octo_plan': {
        const planner = await this.engine.getPlanner();
        const result = await planner.createPlan(args.feature);
        return { success: true, data: result };
      }

      // Execution
      case 'octo_compress': {
        const execution = await this.engine.getExecution();
        const result = execution.compress(args.text, args.level || 'full');
        return { success: true, data: result };
      }

      case 'octo_yagni': {
        const execution = await this.engine.getExecution();
        const result = execution.evaluateYagni(args.code);
        return { success: true, data: result };
      }

      // Memory
      case 'octo_remember': {
        const memory = await this.engine.getMemory();
        const result = await memory.remember(args.content, args.type || 'observation');
        return { success: true, data: result };
      }

      case 'octo_recall': {
        const memory = await this.engine.getMemory();
        const result = await memory.recall(args.query);
        return { success: true, data: result };
      }

      case 'octo_context': {
        const memory = await this.engine.getMemory();
        const result = await memory.getContext(args.sessionId);
        return { success: true, data: result };
      }

      // Knowledge
      case 'octo_scan': {
        const knowledge = await this.engine.getKnowledge();
        const result = await knowledge.scan(args.path);
        return { success: true, data: result };
      }

      case 'octo_graph_query': {
        const knowledge = await this.engine.getKnowledge();
        const result = await knowledge.query(args.question);
        return { success: true, data: result };
      }

      case 'octo_compress_context': {
        const knowledge = await this.engine.getKnowledge();
        const result = await knowledge.compress(args.content);
        return { success: true, data: result };
      }

      // Gateway
      case 'octo_gateway_status': {
        const gateway = await this.engine.getGateway();
        const result = await gateway.status();
        return { success: true, data: result };
      }

      case 'octo_route': {
        const gateway = await this.engine.getGateway();
        const result = await gateway.route(args.tool, args.request);
        return { success: true, data: result };
      }

      // Workflow
      case 'octo_workflow_start': {
        const workflow = await this.engine.getWorkflow();
        const result = await workflow.startWorkflow(args.name, args.description);
        return { success: true, data: result };
      }

      case 'octo_workflow_list': {
        const workflow = await this.engine.getWorkflow();
        const result = await workflow.listWorkflows();
        return { success: true, data: result };
      }

      case 'octo_workflow_status': {
        const workflow = await this.engine.getWorkflow();
        const result = await workflow.getWorkflowStatus(args.workflowId);
        return { success: true, data: result };
      }

      case 'octo_workflow_complete': {
        const workflow = await this.engine.getWorkflow();
        const details = {};
        if (args.phase === 'planning' && args.signoff) {
          details.userSignoff = true;
        }
        const result = await workflow.completePhase(args.workflowId, args.phase, details);
        return { success: true, data: result };
      }

      case 'octo_workflow_check': {
        const workflow = await this.engine.getWorkflow();
        const result = await workflow.checkPhase(args.workflowId, args.phase);
        return { success: true, data: result };
      }

      case 'octo_workflow_todo': {
        const workflow = await this.engine.getWorkflow();
        const result = await workflow.addTodoItem(args.workflowId, args.phase, args.item);
        return { success: true, data: result };
      }

      case 'octo_workflow_steps': {
        const workflow = await this.engine.getWorkflow();
        await workflow.updateSteps(args.workflowId, args.section, args.content);
        return { success: true, data: { updated: true } };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async shutdown() {
    if (this.engine) {
      this.engine.close();
      this.engine = null;
    }
  }
}

module.exports = MCPServer;
