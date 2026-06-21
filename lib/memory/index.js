class MemoryModule {
  constructor(engine) {
    this.engine = engine;
    this.config = engine.config;
    this.store = engine.store;
    this.logger = engine.logger;
  }

  async init() {
    this.logger.info('Memory module initialized');
  }

  async remember(content, type = 'observation') {
    const observation = {
      session_id: null,
      type,
      content,
      created_at: new Date().toISOString()
    };

    this.store.run(
      'INSERT INTO observations (session_id, type, content, created_at) VALUES (?, ?, ?, ?)',
      observation.session_id,
      observation.type,
      observation.content,
      observation.created_at
    );

    this.logger.info(`Stored observation: ${type}`);
    return observation;
  }

  async recall(query) {
    const results = this.store.all(
      `SELECT * FROM observations 
       WHERE content LIKE ? 
       ORDER BY importance DESC, created_at DESC 
       LIMIT 10`,
      `%${query}%`
    );

    this.logger.info(`Found ${results.length} results for: ${query}`);
    return results;
  }

  async getContext(sessionId) {
    const session = this.store.get(
      'SELECT * FROM sessions WHERE id = ?',
      sessionId
    );

    if (!session) {
      return null;
    }

    const observations = this.store.all(
      `SELECT * FROM observations 
       WHERE session_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      sessionId
    );

    return {
      session,
      observations,
      summary: this.generateSummary(observations)
    };
  }

  generateSummary(observations) {
    if (observations.length === 0) {
      return 'No observations recorded.';
    }

    const types = {};
    for (const obs of observations) {
      types[obs.type] = (types[obs.type] || 0) + 1;
    }

    const typeList = Object.entries(types)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');

    return `${observations.length} observations (${typeList})`;
  }

  async consolidate() {
    this.logger.info('Running memory consolidation...');

    const working = this.store.all(
      'SELECT * FROM observations WHERE importance < 3 ORDER BY created_at ASC LIMIT 100'
    );

    this.logger.info(`Consolidated ${working.length} observations`);
    return { consolidated: working.length };
  }
}

module.exports = MemoryModule;
