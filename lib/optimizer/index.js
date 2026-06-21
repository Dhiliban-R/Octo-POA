const fs = require('fs');
const path = require('path');

class TokenOptimizer {
  constructor(octoDir = '.octo') {
    this.octoDir = octoDir;
    this.tokensPath = path.join(octoDir, 'tokens');
    this.usagePath = path.join(this.tokensPath, 'usage.json');
    this.budgetPath = path.join(this.tokensPath, 'budget.json');
  }

  init() {
    if (!fs.existsSync(this.tokensPath)) {
      fs.mkdirSync(this.tokensPath, { recursive: true });
    }

    if (!fs.existsSync(this.usagePath)) {
      fs.writeFileSync(this.usagePath, JSON.stringify({
        total: 0,
        saved: 0,
        sessions: [],
        breakdown: {
          deduplication: 0,
          summarization: 0,
          compression: 0,
          lazyLoading: 0
        }
      }, null, 2));
    }

    if (!fs.existsSync(this.budgetPath)) {
      fs.writeFileSync(this.budgetPath, JSON.stringify({
        daily: 500000,
        session: 100000,
        perTask: 10000
      }, null, 2));
    }
  }

  calculateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  deduplicate(content) {
    const lines = content.split('\n');
    const seen = new Set();
    const unique = [];
    let saved = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        unique.push(line);
      } else if (trimmed) {
        saved += this.calculateTokens(line);
      }
    }

    return {
      content: unique.join('\n'),
      saved,
      originalTokens: this.calculateTokens(content),
      newTokens: this.calculateTokens(unique.join('\n'))
    };
  }

  summarize(content, maxLength = 100) {
    if (content.length <= maxLength) {
      return {
        content,
        saved: 0,
        originalTokens: this.calculateTokens(content),
        newTokens: this.calculateTokens(content)
      };
    }

    const lines = content.split('\n');
    const summary = [];
    let currentLength = 0;

    for (const line of lines) {
      if (currentLength + line.length <= maxLength) {
        summary.push(line);
        currentLength += line.length;
      } else {
        break;
      }
    }

    const summarized = summary.join('\n') + '\n...';
    
    return {
      content: summarized,
      saved: this.calculateTokens(content) - this.calculateTokens(summarized),
      originalTokens: this.calculateTokens(content),
      newTokens: this.calculateTokens(summarized)
    };
  }

  compress(code) {
    const lines = code.split('\n');
    const compressed = [];
    let saved = 0;
    let inComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
        inComment = true;
        saved += this.calculateTokens(line);
        continue;
      }

      if (inComment) {
        if (trimmed.endsWith('*/') || trimmed === '') {
          inComment = false;
        }
        saved += this.calculateTokens(line);
        continue;
      }

      if (trimmed === '' || trimmed === '{' || trimmed === '}') {
        saved += this.calculateTokens(line);
        continue;
      }

      compressed.push(line);
    }

    return {
      content: compressed.join('\n'),
      saved,
      originalTokens: this.calculateTokens(code),
      newTokens: this.calculateTokens(compressed.join('\n'))
    };
  }

  optimize(content, type = 'general') {
    let result;
    let totalSaved = 0;

    switch (type) {
      case 'code':
        result = this.compress(content);
        totalSaved = result.saved;
        break;
      case 'markdown':
        const deduped = this.deduplicate(content);
        const summarized = this.summarize(deduped.content);
        totalSaved = deduped.saved + summarized.saved;
        result = {
          content: summarized.content,
          saved: totalSaved,
          originalTokens: deduped.originalTokens,
          newTokens: summarized.newTokens
        };
        break;
      default:
        result = this.deduplicate(content);
        totalSaved = result.saved;
    }

    this.recordUsage(totalSaved);
    
    return {
      ...result,
      efficiency: totalSaved / (result.originalTokens || 1)
    };
  }

  recordUsage(saved) {
    this.init();
    
    const usage = JSON.parse(fs.readFileSync(this.usagePath, 'utf-8'));
    usage.total += saved;
    usage.saved += saved;
    usage.breakdown.compression += saved;
    
    fs.writeFileSync(this.usagePath, JSON.stringify(usage, null, 2));
  }

  getStatus() {
    this.init();
    
    const usage = JSON.parse(fs.readFileSync(this.usagePath, 'utf-8'));
    const budget = JSON.parse(fs.readFileSync(this.budgetPath, 'utf-8'));
    
    return {
      used: usage.total,
      saved: usage.saved,
      budget: budget.session,
      efficiency: usage.saved / (usage.total || 1),
      breakdown: usage.breakdown
    };
  }

  analyze(content) {
    const lines = content.split('\n');
    const analysis = {
      totalLines: lines.length,
      blankLines: 0,
      commentLines: 0,
      codeLines: 0,
      potentialSavings: 0
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        analysis.blankLines++;
        analysis.potentialSavings += this.calculateTokens(line);
      } else if (trimmed.startsWith('//') || trimmed.startsWith('#') || 
                 trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        analysis.commentLines++;
        analysis.potentialSavings += this.calculateTokens(line);
      } else {
        analysis.codeLines++;
      }
    }

    analysis.totalTokens = this.calculateTokens(content);
    analysis.savingsPercentage = (analysis.potentialSavings / analysis.totalTokens) * 100;
    
    return analysis;
  }
}

module.exports = TokenOptimizer;
