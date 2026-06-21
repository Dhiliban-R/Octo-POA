const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ContextGraph {
  constructor(octoDir = '.octo') {
    this.octoDir = octoDir;
    this.graphPath = path.join(octoDir, 'graph', 'graph.json');
    this.cachePath = path.join(octoDir, 'graph', 'cache');
  }

  init() {
    const graphDir = path.join(this.octoDir, 'graph');
    if (!fs.existsSync(graphDir)) {
      fs.mkdirSync(graphDir, { recursive: true });
    }

    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }

    if (!fs.existsSync(this.graphPath)) {
      fs.writeFileSync(this.graphPath, JSON.stringify({
        nodes: [],
        edges: [],
        metadata: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      }, null, 2));
    }
  }

  load() {
    this.init();
    return JSON.parse(fs.readFileSync(this.graphPath, 'utf-8'));
  }

  save(graph) {
    graph.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.graphPath, JSON.stringify(graph, null, 2));
  }

  hash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
  }

  extractFunctions(code, language = 'javascript') {
    const functions = [];
    const lines = code.split('\n');
    
    const patterns = {
      javascript: [
        /function\s+(\w+)\s*\(/g,
        /const\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
        /(\w+)\s*:\s*(?:async\s*)?\(/g
      ],
      python: [
        /def\s+(\w+)\s*\(/g,
        /async\s+def\s+(\w+)\s*\(/g
      ],
      typescript: [
        /function\s+(\w+)\s*\(/g,
        /const\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
        /(\w+)\s*:\s*(?:async\s*)?\(/g
      ]
    };

    const langPatterns = patterns[language] || patterns.javascript;
    
    lines.forEach((line, index) => {
      for (const pattern of langPatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          functions.push({
            name: match[1],
            line: index + 1,
            type: 'function'
          });
        }
      }
    });

    return functions;
  }

  extractImports(code) {
    const imports = [];
    const lines = code.split('\n');
    
    const patterns = [
      /import\s+.*from\s+['"](.+?)['"]/g,
      /require\s*\(\s*['"](.+?)['"]\s*\)/g,
      /from\s+['"](.+?)['"]/g
    ];

    lines.forEach((line) => {
      for (const pattern of patterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          imports.push(match[1]);
        }
      }
    });

    return imports;
  }

  addNode(node) {
    const graph = this.load();
    
    const existingIndex = graph.nodes.findIndex(n => n.id === node.id);
    if (existingIndex >= 0) {
      graph.nodes[existingIndex] = { ...graph.nodes[existingIndex], ...node };
    } else {
      graph.nodes.push(node);
    }
    
    this.save(graph);
    return node;
  }

  addEdge(edge) {
    const graph = this.load();
    
    const existing = graph.edges.find(
      e => e.source === edge.source && e.target === edge.target
    );
    
    if (!existing) {
      graph.edges.push(edge);
      this.save(graph);
    }
    
    return edge;
  }

  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hash = this.hash(content);
    const lines = content.split('\n').length;
    const tokens = Math.ceil(content.length / 4);
    
    const fileNode = {
      id: filePath,
      type: 'file',
      path: filePath,
      hash,
      lines,
      tokens,
      lastModified: fs.statSync(filePath).mtime.toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    this.addNode(fileNode);
    
    const functions = this.extractFunctions(content);
    functions.forEach(fn => {
      const fnNode = {
        id: `${filePath}:${fn.name}`,
        type: 'function',
        name: fn.name,
        file: filePath,
        line: fn.line,
        calls: []
      };
      this.addNode(fnNode);
      this.addEdge({
        source: filePath,
        target: `${filePath}:${fn.name}`,
        type: 'contains'
      });
    });
    
    const imports = this.extractImports(content);
    imports.forEach(imp => {
      this.addEdge({
        source: filePath,
        target: imp,
        type: 'imports'
      });
    });
    
    return { fileNode, functions, imports };
  }

  scanDirectory(dir = '.', ignorePatterns = ['node_modules', '.git', '.octo']) {
    const results = { files: 0, functions: 0, edges: 0 };
    
    const scan = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (ignorePatterns.includes(entry.name)) continue;
        
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (/\.(js|ts|py|jsx|tsx|md)$/.test(entry.name)) {
          try {
            const result = this.scanFile(fullPath);
            results.files++;
            results.functions += result.functions.length;
          } catch (e) {
            console.error(`Error scanning ${fullPath}:`, e.message);
          }
        }
      }
    };
    
    scan(dir);
    
    const graph = this.load();
    results.edges = graph.edges.length;
    
    return results;
  }

  query(queryString) {
    const graph = this.load();
    const query = queryString.toLowerCase();
    
    const results = {
      files: [],
      functions: [],
      edges: []
    };
    
    results.files = graph.nodes.filter(n => 
      n.type === 'file' && n.path.toLowerCase().includes(query)
    );
    
    results.functions = graph.nodes.filter(n => 
      n.type === 'function' && n.name.toLowerCase().includes(query)
    );
    
    results.edges = graph.edges.filter(e => 
      e.source.toLowerCase().includes(query) || 
      e.target.toLowerCase().includes(query)
    );
    
    return results;
  }

  findUnused() {
    const graph = this.load();
    const targets = new Set(graph.edges.map(e => e.target));
    
    return graph.nodes.filter(n => 
      n.type === 'function' && !targets.has(n.id)
    );
  }

  findDependencies(filePath) {
    const graph = this.load();
    const visited = new Set();
    const dependencies = [];
    
    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const edges = graph.edges.filter(e => e.source === nodeId);
      for (const edge of edges) {
        dependencies.push(edge.target);
        traverse(edge.target);
      }
    };
    
    traverse(filePath);
    return dependencies;
  }

  getStats() {
    const graph = this.load();
    
    return {
      totalNodes: graph.nodes.length,
      files: graph.nodes.filter(n => n.type === 'file').length,
      functions: graph.nodes.filter(n => n.type === 'function').length,
      totalEdges: graph.edges.length,
      totalTokens: graph.nodes.reduce((sum, n) => sum + (n.tokens || 0), 0),
      lastUpdated: graph.metadata.lastUpdated
    };
  }

  visualize() {
    const graph = this.load();
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Octo-POA Context Graph</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .node { padding: 10px; margin: 5px; border: 1px solid #ccc; border-radius: 5px; }
    .file { background: #e3f2fd; }
    .function { background: #f3e5f5; }
    .stats { margin-bottom: 20px; padding: 10px; background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Octo-POA Context Graph</h1>
  <div class="stats">
    <strong>Nodes:</strong> ${graph.nodes.length} | 
    <strong>Edges:</strong> ${graph.edges.length} |
    <strong>Last Updated:</strong> ${graph.metadata.lastUpdated}
  </div>
  <h2>Files</h2>
  <div class="nodes">
    ${graph.nodes.filter(n => n.type === 'file').map(n => `
      <div class="node file">
        <strong>${n.path}</strong><br>
        Lines: ${n.lines} | Tokens: ${n.tokens}
      </div>
    `).join('')}
  </div>
  <h2>Functions</h2>
  <div class="nodes">
    ${graph.nodes.filter(n => n.type === 'function').map(n => `
      <div class="node function">
        <strong>${n.name}</strong><br>
        File: ${n.file} | Line: ${n.line}
      </div>
    `).join('')}
  </div>
</body>
</html>`;
    
    const vizPath = path.join(this.octoDir, 'graph', 'graph.html');
    fs.writeFileSync(vizPath, html);
    return vizPath;
  }
}

module.exports = ContextGraph;
