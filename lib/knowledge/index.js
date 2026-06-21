const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class KnowledgeModule {
  constructor(engine) {
    this.engine = engine;
    this.config = engine.config;
    this.store = engine.store;
    this.logger = engine.logger;
  }

  async init() {
    this.logger.info('Knowledge module initialized');
  }

  async scan(projectPath) {
    const scanPath = projectPath || this.engine.projectPath || process.cwd();
    this.logger.info(`Scanning: ${scanPath}`);

    const files = this.findFiles(scanPath);
    this.logger.info(`Found ${files.length} files`);

    for (const file of files) {
      await this.processFile(file);
    }

    this.logger.info('Scan complete');
    return { filesProcessed: files.length };
  }

  findFiles(dir, extensions = ['.js', '.ts', '.py', '.go', '.rs', '.java']) {
    const files = [];

    const walk = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', '__pycache__'].includes(entry.name)) {
            walk(fullPath);
          }
        } else if (extensions.includes(path.extname(entry.name))) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      const existing = this.store.get(
        'SELECT * FROM graph_nodes WHERE path = ?',
        filePath
      );

      if (existing && existing.hash === hash) {
        return;
      }

      const node = {
        id: filePath,
        type: 'file',
        name: path.basename(filePath),
        path: filePath,
        hash,
        tokens: content.split(/\s+/).length,
        metadata: JSON.stringify({ ext: path.extname(filePath) }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.store.run(
        `INSERT OR REPLACE INTO graph_nodes (id, type, name, path, hash, tokens, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        node.id,
        node.type,
        node.name,
        node.path,
        node.hash,
        node.tokens,
        node.metadata,
        node.created_at,
        node.updated_at
      );

      this.logger.debug(`Processed: ${filePath}`);
    } catch (e) {
      this.logger.warn(`Failed to process ${filePath}: ${e.message}`);
    }
  }

  async query(question) {
    this.logger.info(`Querying: ${question}`);

    const files = this.store.all(
      'SELECT * FROM graph_nodes WHERE type = ? ORDER BY tokens DESC LIMIT 10',
      'file'
    );

    return {
      question,
      results: files,
      summary: `Found ${files.length} files matching query`
    };
  }

  async compress(content) {
    const originalTokens = content.split(/\s+/).length;

    let compressed = content;

    compressed = compressed.replace(/\/\/.*$/gm, '');
    compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '');
    compressed = compressed.replace(/#.*/gm, '');
    compressed = compressed.replace(/\s+/g, ' ').trim();

    const compressedTokens = compressed.split(/\s+/).length;
    const savings = ((originalTokens - compressedTokens) / originalTokens * 100).toFixed(1);

    this.logger.info(`Compressed context: ${originalTokens} → ${compressedTokens} tokens (${savings}% savings)`);

    return {
      original: content,
      compressed,
      originalTokens,
      compressedTokens,
      savings: parseFloat(savings)
    };
  }
}

module.exports = KnowledgeModule;
