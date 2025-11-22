# Contributing to HomeMore

Thank you for your interest in contributing to HomeMore! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/vsemashko/long-rent/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check [existing feature requests](https://github.com/vsemashko/long-rent/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a new issue with:
   - Clear use case description
   - Expected behavior
   - Why this feature would be valuable
   - Possible implementation approach

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all tests pass** (`npm test`)
6. **Format your code** (`npm run format`)
7. **Submit a pull request**

## Development Workflow

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/long-rent.git
cd long-rent

# Add upstream remote
git remote add upstream https://github.com/vsemashko/long-rent.git

# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev
```

### Branch Naming

- `feature/` - New features (e.g., `feature/viewing-scheduler`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-module`)
- `test/` - Test additions/improvements (e.g., `test/payment-flow`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add social login with Google

fix(search): resolve map marker clustering issue

docs(api): update authentication endpoints

test(payments): add Stripe webhook tests
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define explicit types (avoid `any`)
- Use interfaces for objects
- Use enums for constants

### Code Style

- Follow existing code style (enforced by ESLint and Prettier)
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await instead of promises chains

### React/Next.js

- Use functional components with hooks
- Keep components small and reusable
- Use TypeScript for props
- Extract complex logic to custom hooks
- Use proper file structure:
  ```
  ComponentName/
  ├── index.tsx
  ├── ComponentName.tsx
  ├── ComponentName.test.tsx
  └── types.ts
  ```

### NestJS

- Follow NestJS best practices
- Use dependency injection
- Keep controllers thin, logic in services
- Use DTOs for validation
- Write unit tests for services
- Document APIs with Swagger decorators

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --filter=api

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

### Test Coverage

- Aim for 80%+ coverage
- All new features must include tests
- Critical paths must have E2E tests

## Documentation

- Update README.md for major changes
- Update API documentation (Swagger comments)
- Add JSDoc comments for public APIs
- Update relevant guides in `/docs`

## Database Changes

When modifying the database schema:

1. Create a new Prisma migration:
   ```bash
   npm run db:migrate:dev --name=descriptive_name
   ```

2. Update seed data if needed:
   ```bash
   npm run db:seed
   ```

3. Document the change in the PR description

## Performance

- Use React.memo for expensive components
- Implement proper pagination for lists
- Use database indexes for frequent queries
- Optimize images (Next.js Image component)
- Monitor bundle size (keep under 200KB)

## Security

- Never commit secrets or API keys
- Sanitize user inputs
- Use parameterized queries (Prisma handles this)
- Validate all data on backend
- Follow OWASP Top 10 guidelines

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain color contrast (WCAG AA)
- Test with screen readers

## Pull Request Process

1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks locally:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

3. **Create pull request** with:
   - Clear title and description
   - Link to related issue
   - Screenshots/videos if UI changes
   - Test plan description
   - Breaking changes noted

4. **Address review feedback** promptly

5. **Squash commits** if requested

## Review Process

- PRs require approval from at least one maintainer
- CI must pass (tests, linting, type checking)
- All conversations must be resolved
- Branch must be up to date with main

## Getting Help

- Join our [Discord](https://discord.gg/homemore) (Coming soon)
- Ask in GitHub Discussions
- Tag maintainers in issues (@vsemashko)
- Email: dev@homemore.pl

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to HomeMore! 🏠❤️
