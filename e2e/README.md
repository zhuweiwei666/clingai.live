# E2E Testing Suite

This directory contains Playwright E2E tests for parity verification with the benchmark site.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Update visual regression snapshots
```bash
npm run test:e2e:update
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

- `tests/critical-flows.spec.js` - Critical user journey tests
- `tests/visual-regression.spec.js` - Visual comparison with benchmark
- `tests/api-contract.spec.js` - API response format verification
- `fixtures/auth.js` - Authentication fixtures
- `utils/parity.js` - Parity comparison utilities

## Environment Variables

- `PLAYWRIGHT_BASE_URL` - Base URL for our site (default: http://localhost:5173)
- `API_BASE_URL` - Base URL for API (default: http://localhost:3001/api)
- `CI` - Set to true in CI environment

## Visual Regression

Visual regression tests compare screenshots of our implementation with the benchmark site. To update baselines:

1. Run tests to generate initial screenshots
2. Review differences
3. Run `npm run test:e2e:update` to accept changes

## CI Integration

Tests can be run in CI/CD pipelines. Set `CI=true` environment variable for CI-specific settings.

