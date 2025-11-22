# Testing Guide

Comprehensive testing guide for the HomeMore platform covering unit tests, integration tests, E2E tests, and cross-browser testing.

## Table of Contents

- [Quick Start](#quick-start)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Cross-Browser Testing](#cross-browser-testing)
- [Mobile Testing](#mobile-testing)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
npm run test:e2e:ui       # E2E tests in UI mode

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## Unit Tests

### Frontend Unit Tests (Jest + React Testing Library)

**Location**: `apps/web/src/**/__tests__/*.test.{ts,tsx}`

**Running Tests**:
```bash
cd apps/web
npm test
```

**Coverage Thresholds** (configured in `jest.config.js`):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Existing Test Suites**:

1. **Analytics Utilities** (`lib/__tests__/analytics.test.ts`)
   - Event tracking (GA4 & Mixpanel)
   - Page view tracking
   - User identification
   - Reset functionality
   - 13 test cases

2. **Accessibility Utilities** (`lib/__tests__/accessibility.test.ts`)
   - ARIA label generation
   - Screen reader announcements
   - Status text formatting
   - Currency/date formatting
   - 14 test cases

3. **Button Component** (`components/ui/__tests__/button.test.tsx`)
   - Rendering with variants
   - Click handling
   - Disabled state
   - Keyboard accessibility
   - 8 test cases

**Writing New Tests**:

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Backend Unit Tests (Jest + NestJS Testing)

**Location**: `apps/api/src/**/*.spec.ts`

**Running Tests**:
```bash
cd apps/api
npm test
```

**Existing Test Suites**:

1. **Auth Service** (`modules/auth/auth.service.spec.ts`)
   - User registration
   - Login with credentials
   - User validation
   - Logout
   - Password hashing
   - Error handling
   - 8 test suites with multiple test cases

**Writing New Tests**:

```typescript
// Example service test
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should perform action', async () => {
    const result = await service.doSomething();
    expect(result).toEqual(expectedValue);
  });
});
```

---

## Integration Tests

### API Integration Tests (Supertest)

**Location**: `apps/api/test/*.e2e-spec.ts`

**Running Tests**:
```bash
cd apps/api
npm run test:e2e
```

**Existing Test Suites**:

1. **Auth API** (`test/auth.e2e-spec.ts`)
   - POST /auth/register
   - POST /auth/login
   - GET /auth/me
   - POST /auth/logout
   - 11 comprehensive test cases

**Features**:
- Full request/response validation
- Database cleanup between tests
- Error scenario testing
- Authentication flow testing

**Writing New Integration Tests**:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/my-endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/my-endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

---

## E2E Tests

### Playwright E2E Tests

**Location**: `apps/web/e2e/*.spec.ts`

**Running Tests**:
```bash
cd apps/web

# Run all tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run specific browser
npx playwright test --project=chromium
```

**Existing Test Suites**:

1. **Authentication** (`e2e/auth.spec.ts`)
   - Login flow
   - Registration flow
   - Form validation
   - Error handling

2. **Property Search** (`e2e/property-search.spec.ts`)
   - Search functionality
   - Filters
   - Property detail page
   - Responsive design

3. **Rental Flow** (`e2e/rental-flow.spec.ts`)
   - Complete rental lifecycle
   - Authentication requirements
   - Landlord workflows
   - Accessibility compliance (axe-core)

**Writing New E2E Tests**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-page');

    await page.fill('input[name="username"]', 'test');
    await page.click('button[type="submit"]');

    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

## Cross-Browser Testing

### Supported Browsers

Tests run on the following browsers:
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ Tablet (iPad Pro)

### Running Cross-Browser Tests

```bash
# Run on all browsers
npm run test:e2e

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari

# Run tablet tests
npx playwright test --project=tablet
```

### Browser-Specific Configuration

Configuration is in `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
]
```

---

## Mobile Testing

### Responsive Design Testing

**Manual Testing Checklist**:
- [ ] Navigation menu works on mobile
- [ ] Forms are usable on small screens
- [ ] Images scale properly
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Modals/dialogs fit on screen

### Automated Mobile Tests

```bash
# Run mobile Chrome tests
npx playwright test --project=mobile-chrome

# Run mobile Safari tests
npx playwright test --project=mobile-safari

# Run with device emulation
npx playwright test --project=mobile-chrome --headed
```

### Testing Different Screen Sizes

```typescript
test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    // Test mobile-specific functionality
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    // Test tablet-specific functionality
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');
    // Test desktop-specific functionality
  });
});
```

---

## Test Coverage

### Generating Coverage Reports

**Frontend**:
```bash
cd apps/web
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

**Backend**:
```bash
cd apps/api
npm run test:cov

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Thresholds

**Current Thresholds** (70% minimum):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Excluded from Coverage**:
- Type definition files (*.d.ts)
- Story files (*.stories.tsx)
- Test files (__tests__/*)

### Viewing Coverage

```bash
# Frontend
cd apps/web
npm run test:coverage

# Backend
cd apps/api
npm run test:cov
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Running Tests in Docker

```dockerfile
# Dockerfile.test
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

CMD ["npm", "test"]
```

```bash
# Build and run
docker build -t homemore-tests -f Dockerfile.test .
docker run homemore-tests
```

---

## Best Practices

### General

1. **Write tests first** (TDD) when fixing bugs
2. **Keep tests focused** - one concept per test
3. **Use descriptive names** - test names should describe behavior
4. **Avoid test interdependence** - tests should run in any order
5. **Clean up after tests** - reset state between tests

### Performance

1. **Mock external dependencies** - APIs, databases
2. **Use test data factories** - consistent test data
3. **Parallelize when possible** - run tests concurrently
4. **Skip slow tests in watch mode** - tag with @slow

### Accessibility Testing

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm install
```

**Issue**: Playwright browsers not installed
```bash
# Solution: Install browsers
npx playwright install --with-deps
```

**Issue**: Port already in use
```bash
# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Issue**: Database connection errors in tests
```bash
# Solution: Ensure test database is running
docker-compose -f docker-compose.test.yml up -d
```

---

## Test Execution Summary

### Current Test Coverage

**Frontend**:
- Unit tests: 35+ test cases
- E2E tests: 3 comprehensive suites
- Coverage: Configured for 70%+

**Backend**:
- Unit tests: 8+ test suites
- Integration tests: 11 test cases
- Coverage: Configured for 70%+

**Total**: 50+ automated test cases

### Running All Tests

```bash
# From project root
npm test                    # All unit tests
npm run test:e2e           # All E2E tests
npm run test:coverage      # All tests with coverage

# Run everything
npm run test:all
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: November 22, 2025
