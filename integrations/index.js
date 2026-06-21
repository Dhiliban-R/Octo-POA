const ClaudeAdapter = require('./claude');
const CodexAdapter = require('./codex');
const GeminiAdapter = require('./gemini');
const CursorAdapter = require('./cursor');
const GenericAdapter = require('./generic');

const adapters = {
  claude: ClaudeAdapter,
  codex: CodexAdapter,
  gemini: GeminiAdapter,
  cursor: CursorAdapter,
  generic: GenericAdapter
};

function getAdapter(name, engine) {
  const AdapterClass = adapters[name] || adapters.generic;
  return new AdapterClass(engine, name);
}

function listAdapters() {
  return Object.keys(adapters);
}

module.exports = {
  ClaudeAdapter,
  CodexAdapter,
  GeminiAdapter,
  CursorAdapter,
  GenericAdapter,
  getAdapter,
  listAdapters
};
