# Contributing to Octo-POA

Thank you for your interest in contributing to Octo-POA! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/octo-poa.git
   cd octo-poa
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/dhili/octo-poa.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Development Commands

```bash
# Run in development mode
npm run dev

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
octo-poa/
├── bin/                    # CLI entry points
│   ├── octo.js            # Main CLI
│   └── mcp-server.js      # MCP server
├── lib/                   # Core library
│   ├── core/              # Engine, config, store, logger
│   ├── planner/           # Planning module
│   ├── execution/         # Execution module (compression, YAGNI)
│   ├── memory/            # Memory module
│   ├── knowledge/         # Knowledge graph module
│   ├── gateway/           # Gateway layer
│   ├── workflow/          # Workflow engine
│   └── index.js           # Main exports
├── mcp/                   # MCP server implementation
├── integrations/          # Agent adapters
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes** - Fix issues in existing functionality
- **New features** - Add new capabilities to the platform
- **Documentation** - Improve or add documentation
- **Tests** - Add or improve test coverage
- **Refactoring** - Improve code quality without changing behavior
- **Performance** - Optimize speed or resource usage

### Before Contributing

1. **Check existing issues** - Look for open issues or create a new one
2. **Discuss major changes** - For large features, open an issue first to discuss the approach
3. **Follow the style guidelines** - Ensure your code matches the project's style

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clear, concise commit messages
- Keep changes focused and minimal
- Add tests for new functionality
- Update documentation if needed

### 3. Run Tests

```bash
npm test
npm run test:unit
npm run lint
```

Ensure all tests pass before submitting.

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: fix bug description"
```

Use [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your branch from the dropdown
- Fill in the PR template with:
  - **Title**: Clear, concise description
  - **Description**: What changed and why
  - **Related Issues**: Link to related issues (e.g., "Closes #123")
  - **Testing**: How you tested your changes
  - **Screenshots**: If applicable, add screenshots

### 7. Code Review

- Respond to review comments promptly
- Make requested changes
- Re-request review when ready

### 8. Merge

Once approved, a maintainer will merge your PR.

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear title** - Summarize the issue
2. **Steps to reproduce** - Detailed steps to reproduce the problem
3. **Expected behavior** - What you expected to happen
4. **Actual behavior** - What actually happened
5. **Environment**:
   - Node.js version
   - npm version
   - Operating system
   - Octo-POA version
6. **Screenshots** - If applicable
7. **Additional context** - Any other relevant information

### Feature Requests

When requesting features, please include:

1. **Clear title** - Summarize the feature
2. **Problem description** - What problem does this solve?
3. **Proposed solution** - How you envision it working
4. **Alternatives considered** - Other solutions you thought about
5. **Additional context** - Any other relevant information

## Style Guidelines

### JavaScript Style

- Use **ES6+** features where appropriate
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and constructors
- Use **UPPER_SNAKE_CASE** for constants
- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons** at the end of statements
- Add **JSDoc comments** for complex functions

### Example

```javascript
/**
 * Compresses output text to reduce token usage.
 * @param {string} text - The text to compress
 * @param {string} level - Compression level (lite/full/ultra)
 * @returns {Object} Compressed text with savings info
 */
function compress(text, level = 'full') {
  // Implementation
  return {
    compressed: compressedText,
    savings: savingsPercentage
  };
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add new compression algorithm

- Implement SmartCrusher for JSON compression
- Add 6 compression levels
- Include token savings calculation

Closes #123
```

## Testing

### Writing Tests

- Write tests for **all new functionality**
- Use **descriptive test names**
- Follow the **AAA pattern**: Arrange, Act, Assert
- Test **edge cases** and **error conditions**
- Keep tests **independent** and **fast**

### Test Structure

```javascript
describe('Module Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = module.function(input);
    
    // Assert
    expect(result).toBe(expectedOutput);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test:unit -- tests/core.test.js
```

## Documentation

### Code Documentation

- Add **JSDoc comments** for all public functions
- Include **parameter descriptions** and **return types**
- Add **usage examples** for complex functions

### README Updates

When adding new features:
- Update the **Features** section
- Add **CLI commands** to the Commands section
- Update **MCP tools** if applicable
- Add **examples** in the Quick Start section

### CHANGELOG Updates

Always update CHANGELOG.md with your changes:
- Add entries under the appropriate version
- Follow the format: `- **Feature Name** - Description`
- Group by category (Added, Changed, Deprecated, Removed, Fixed, Security)

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the "question" label

Thank you for contributing to Octo-POA!
