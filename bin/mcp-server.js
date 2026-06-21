#!/usr/bin/env node

const MCPServer = require('../mcp/server');

async function main() {
  const server = new MCPServer();
  
  const projectPath = process.argv[2] || process.cwd();
  
  try {
    await server.init(projectPath);
    
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    let buffer = '';
    
    stdin.setEncoding('utf8');
    
    stdin.on('data', async (chunk) => {
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop();
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = await handleRequest(request, server);
            stdout.write(JSON.stringify(response) + '\n');
          } catch (e) {
            stdout.write(JSON.stringify({
              jsonrpc: '2.0',
              error: { code: -32700, message: 'Parse error' },
              id: null
            }) + '\n');
          }
        }
      }
    });
    
    stdin.on('end', async () => {
      await server.shutdown();
      process.exit(0);
    });
    
  } catch (e) {
    console.error('Failed to initialize MCP server:', e.message);
    process.exit(1);
  }
}

async function handleRequest(request, server) {
  const { method, params, id } = request;
  
  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'octo-poa',
            version: '0.1.0'
          }
        },
        id
      };
    
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        result: {
          tools: server.tools
        },
        id
      };
    
    case 'tools/call':
      try {
        const result = await server.handleToolCall(params.name, params.arguments);
        return {
          jsonrpc: '2.0',
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          },
          id
        };
      } catch (e) {
        return {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: e.message
          },
          id
        };
      }
    
    default:
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        },
        id
      };
  }
}

main();
