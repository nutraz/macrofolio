# Contributing to Macrofolio

Thank you for your interest in contributing to Macrofolio! This document provides guidelines and instructions for contributing.

## 🤝 Ways to Contribute

There are many ways to contribute to Macrofolio:

- **🐛 Bug Reports**: Submit bug reports through GitHub Issues
- **💡 Feature Requests**: Suggest new features or improvements
- **📝 Documentation**: Improve or translate documentation
- **🔧 Code Contributions**: Fix bugs, add features, or improve performance
- **🎨 Design**: Improve UI/UX or create design assets
- **📊 Testing**: Write or improve test coverage

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+
- Git
- npm, yarn, or pnpm
- Basic understanding of React, TypeScript, and blockchain concepts

### Development Workflow

1. **Fork the Repository**

   Visit [https://github.com/nutrazz/macrofolio](https://github.com/nutrazz/macrofolio) and click "Fork"

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/macrofolio.git
   cd macrofolio
   ```

3. **Set Up Development Environment**

   ```bash
   # Web app
   cd macrofinal/web

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Create a Feature Branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

5. **Make Changes**

   Follow the code standards outlined below.

6. **Test Your Changes**

   ```bash
   # Run web tests
   cd macrofinal/web
   npm test

   # Run key security tests
   npm run test:security
   ```

7. **Commit Changes**

   We follow conventional commits:

   ```bash
   git commit -m "feat: add amazing new feature"
   git commit -m "fix: resolve critical security issue"
   git commit -m "docs: update API documentation"
   ```

8. **Push and Create PR**

   ```bash
   git push origin feature/amazing-feature
   ```

   Then create a Pull Request through GitHub.

## 📋 Code Standards

### TypeScript

- Strict mode enabled
- No `any` types without explicit justification
- Use interfaces over types for objects
- Prefer functional components with hooks

### ESLint & Prettier

We use ESLint and Prettier for code formatting:

```bash
# Check formatting
npm run lint

# Auto-fix formatting
npm run lint:fix
```

### Git Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Testing Requirements

- Aim for 80%+ test coverage
- Write tests for new features
- Include edge cases in test scenarios
- Use Jest for unit tests

## 🏗️ Architecture Guidelines

### Component Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── sections/       # Dashboard sections
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configurations
└── __tests__/      # Test files
```

### Smart Contract Guidelines

- Follow Solidity best practices
- Include NatSpec documentation
- Write comprehensive tests
- Use OpenZeppelin contracts when possible

## 🔒 Security Considerations

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow secure coding practices
- Report security vulnerabilities privately

## 📖 Documentation

- Update README.md for user-facing changes
- Add code comments for complex logic
- Update API documentation for endpoint changes
- Include examples in documentation

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Clear Title**: Summarize the issue
2. **Description**: Detailed explanation
3. **Steps to Reproduce**: Numbered list
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots/Logs**: Visual evidence
7. **Environment**: OS, Node version, browser

## 💡 Suggesting Features

When suggesting features, include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: Your suggested approach
3. **Use Cases**: Specific scenarios
4. **Alternatives**: Other approaches considered
5. **Additional Context**: Relevant screenshots or mockups

## 📝 Pull Request Guidelines

- Keep PRs focused and small
- Include screenshots for UI changes
- Address all review comments
- Maintain test coverage
- Update documentation as needed

## 💬 Community

- Be respectful and inclusive
- Help other contributors
- Participate in discussions
- Follow our Code of Conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make Macrofolio better! 🚀**
