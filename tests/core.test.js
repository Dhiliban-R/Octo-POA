import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { OctoEngine } from '../lib';

describe('Octo-POA Core', () => {
  let engine;
  const testDir = path.join(__dirname, 'test-project');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (engine) engine.close();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should initialize engine', async () => {
    engine = new OctoEngine(testDir);
    await engine.init();
    expect(engine).toBeDefined();
    expect(engine.store).toBeDefined();
  });

  it('should have config', () => {
    expect(engine.config).toBeDefined();
    expect(engine.config.get('version')).toBe('0.1.0');
  });

  it('should compress text', async () => {
    const execution = await engine.getExecution();
    const text = 'Sure! I would be happy to help you with that. The file is basically just a simple configuration file.';
    const result = execution.compress(text, 'full');
    expect(result.compressed).toBeDefined();
    expect(result.savings).toBeGreaterThan(0);
  });

  it('should store observations', async () => {
    const memory = await engine.getMemory();
    const obs = await memory.remember('Test observation');
    expect(obs).toBeDefined();
    expect(obs.content).toBe('Test observation');
  });

  it('should recall observations', async () => {
    const memory = await engine.getMemory();
    const results = await memory.recall('Test');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });

  it('should scan files', async () => {
    const knowledge = await engine.getKnowledge();
    const result = await knowledge.scan(testDir);
    expect(result).toBeDefined();
    expect(result.filesProcessed).toBeDefined();
  });
});
