# Automated Testing Guide

This project is set up with **Playwright** for automated end-to-end (E2E) testing. This allows you to verify that the application is working correctly without manual testing.

## Prerequisites

- Node.js installed
- Dependencies installed (`npm install`)

## Running Tests

To run all tests, execute the following command in your terminal:

```bash
npx playwright test
```

This will run all tests in "headless" mode (no browser window visible) and show the results in the terminal.

### Viewing the Report

If tests fail, or if you want to see a detailed report, run:

```bash
npx playwright show-report
```

### Running with UI

To run tests with a visual UI where you can see the browser and debug steps:

```bash
npx playwright test --ui
```

## Test Files

- **`tests/example.spec.ts`**: Contains the initial E2E tests for critical flows:
    - App title check
    - Dashboard loading
    - Navigation to CRM
    - Navigation to Settings

## Configuration

- **`playwright.config.ts`**: Main configuration file.
    - `baseURL`: Set to `http://localhost:3000`
    - `viewport`: Default viewport size for tests.

## Adding New Tests

You can add new tests by creating new `.spec.ts` files in the `tests` directory or adding to `tests/example.spec.ts`.

Example test:

```typescript
test('new feature works', async ({ page }) => {
  await page.goto('/');
  await page.getByText('New Feature').click();
  await expect(page.getByText('Success')).toBeVisible();
});
```
