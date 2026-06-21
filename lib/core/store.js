const path = require('path');
const fs = require('fs');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  Database = null;
}

class Store {
  constructor(config) {
    this.config = config;
    this.dbPath = path.join(config.getOctoDir(), 'octo.db');
    this.db = null;
  }

  init() {
    if (!Database) {
      throw new Error('better-sqlite3 is required. Run: npm install better-sqlite3');
    }

    this.config.ensureOctoDir();
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('foreign_keys = ON');

    this.createTables();
    return this;
  }

  createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        project_path TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        status TEXT DEFAULT 'active',
        context TEXT,
        decisions TEXT,
        progress TEXT,
        issues TEXT,
        tokens_used INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        facts TEXT,
        concepts TEXT,
        importance INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        accessed_count INTEGER DEFAULT 0,
        last_accessed TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tier TEXT NOT NULL DEFAULT 'working',
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB,
        importance INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        accessed_count INTEGER DEFAULT 0,
        last_accessed TEXT,
        expires_at TEXT
      );

      CREATE TABLE IF NOT EXISTS facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER,
        entity_source TEXT,
        relationship TEXT,
        entity_target TEXT,
        valid_at TEXT,
        expired_at TEXT,
        invalid_at TEXT,
        confidence REAL DEFAULT 1.0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (source_id) REFERENCES observations(id)
      );

      CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        path TEXT,
        hash TEXT,
        tokens INTEGER DEFAULT 0,
        metadata TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS graph_edges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        type TEXT NOT NULL,
        weight REAL DEFAULT 1.0,
        metadata TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (source_id) REFERENCES graph_nodes(id),
        FOREIGN KEY (target_id) REFERENCES graph_nodes(id)
      );

      CREATE TABLE IF NOT EXISTS token_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        operation TEXT NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        saved_tokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);
      CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);
      CREATE INDEX IF NOT EXISTS idx_memories_tier ON memories(tier);
      CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON graph_nodes(type);
      CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_id);
      CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_id);
      CREATE INDEX IF NOT EXISTS idx_token_usage_session ON token_usage(session_id);
    `);
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }

  run(sql, ...params) {
    return this.db.prepare(sql).run(...params);
  }

  get(sql, ...params) {
    return this.db.prepare(sql).get(...params);
  }

  all(sql, ...params) {
    return this.db.prepare(sql).all(...params);
  }

  transaction(fn) {
    return this.db.transaction(fn)();
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

module.exports = Store;
