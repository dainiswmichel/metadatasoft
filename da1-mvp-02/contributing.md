# Contributing to DA1.FM MVP-01

Thank you for your interest in contributing to the DA1.FM project! This document provides guidelines and instructions for contributing to the codebase.

## Code of Conduct

Please be respectful and constructive in all interactions related to this project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/da1-fm-mvp-01.git
   cd da1-fm-mvp-01
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.template .env
   # Edit .env to match your local environment
   ```

4. **Create Required Directories**
   ```bash
   npm run setup
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Coding Standards

### General Guidelines

- Follow the existing code style and structure
- Write clear, descriptive comments
- Maintain separation of concerns between services
- Prioritize security and input validation

### JavaScript

- Use modern ES6+ features where appropriate
- Prefer `const` over `let` when variables won't be reassigned
- Use meaningful variable and function names
- Use async/await for asynchronous operations
- Document functions with JSDoc comments

### Security

- Sanitize all inputs, especially those used in system operations
- Use spawn() instead of exec() for running external processes
- Validate file types and sizes before processing
- Always check for path traversal attempts in file operations
- Use parameterized queries if adding database functionality

## Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Implement your changes following the coding standards
   - Add or update tests as needed
   - Ensure all tests pass

3. **Commit Changes**
   ```bash
   git commit -m "Descriptive commit message"
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Submit Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Explain how to test the changes

## Testing

- Write unit tests for new functionality
- Ensure existing tests pass
- Test across different operating systems if possible
- Verify FFmpeg commands work as expected

## Documentation

- Update README.md for any user-facing changes
- Document APIs with clear examples
- Update JSDoc comments for code changes
- Keep the implementation summary current

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license.

## Questions?

If you have any questions about contributing, please contact the DA1.FM team.
