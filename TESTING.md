# Testing Guide

This project includes comprehensive testing coverage with both unit tests and end-to-end tests.

## Test Structure

```
├── components/__tests__/          # Unit tests for React components
├── app/api/market/__tests__/      # Unit tests for API routes
├── e2e/                           # Playwright E2E tests
├── vitest.config.ts               # Vitest configuration
├── vitest.setup.ts                # Vitest setup and mocks
└── playwright.config.ts           # Playwright configuration
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
bun test:e2e

# Run E2E tests with UI
bun test:e2e:ui

# Run E2E tests in headed mode
bunx playwright test --headed
```

## Test Coverage

### Task 6.4: ChartComponent Unit Tests

**Requirements: 4.2, 11.2, 11.4**

Tests for the ChartComponent including:

- Chart type switching (Line, Area, Candlestick)
- Time range changes (1D, 1W, 1M, 3M, 1Y, 5Y, Max)
- Responsive behavior
- Indicator toggles
- Error handling
- Data point hover interactions

Location: `components/__tests__/ChartComponent.test.tsx`

### Task 5.13: API Routes Unit Tests

**Requirements: 3.5, 14.2**

Tests for Market Data API routes including:

- Successful data retrieval
- Caching behavior
- Rate limiting
- Error responses

Location: `app/api/market/__tests__/symbol.test.ts`

### Playwright E2E Tests

Comprehensive end-to-end tests for chart functionality:

- Chart loading and rendering
- User interactions (clicking buttons, switching views)
- Theme toggling
- Responsive design on different viewports
- State persistence across interactions

Location: `e2e/chart.spec.ts`

## Test Implementation Status

✅ **Completed:**

- Vitest setup and configuration
- Playwright setup and configuration
- ChartComponent unit test structure
- API routes unit test structure
- E2E test suite for charts
- Test scripts in package.json

⚠️ **Note:**
The unit tests for ChartComponent require additional mocking for the Lightweight Charts library due to its canvas-based rendering. The test structure is in place and can be extended with proper mocks.

The API route tests are placeholder tests that demonstrate the structure. They should be implemented with actual API mocking when the routes are fully functional.

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("should navigate to page", async ({ page }) => {
  await page.goto("/my-page");
  await expect(page.locator("h1")).toContainText("My Page");
});
```

## CI/CD Integration

The tests are configured to run in CI environments:

- Vitest runs with `--run` flag (no watch mode)
- Playwright runs with retries and single worker in CI
- Test reports are generated in HTML format

## Troubleshooting

### Vitest Issues

- Ensure jsdom is installed: `bun add -d jsdom`
- Check vitest.config.ts for proper environment setup
- Verify test files are in `__tests__` directories

### Playwright Issues

- Install browsers: `bunx playwright install`
- Ensure dev server is running for E2E tests
- Check playwright.config.ts for correct baseURL

## Future Improvements

1. Add coverage thresholds
2. Implement visual regression testing
3. Add performance testing
4. Integrate with CI/CD pipeline
5. Add more comprehensive API mocking
6. Implement property-based tests (as defined in spec)
