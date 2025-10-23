# E2E Screenshot Capture System

## Overview
Automatic before/after screenshot capture for all E2E tests, implemented via Playwright fixture.

## Implementation
**Fixture**: `e2e/fixtures/screenshot-fixture.ts`

### Features
- **Auto Before/After**: Captures full-page screenshot before and after EVERY test
- **Failure Capture**: Additional screenshot on test failure
- **Console Monitoring**: Integrated ConsoleMonitor for error detection
- **Authentication**: Built-in `authenticatedPage` fixture (auto-login)

## Screenshot Locations
```
test-results/screenshots/
├── {test-name}-before-{timestamp}.png
├── {test-name}-after-{timestamp}.png
└── {test-name}-FAILURE-{timestamp}.png  (if test fails)
```

## Naming Convention
- **Test Name**: Sanitized (lowercase, dashes only)
- **Timestamp**: ISO 8601 format with dashes (no colons/dots)
- **Example**: `should-load-product-detail-before-2025-10-16t14-20-30-123z.png`

## Usage in Tests
All test files automatically use the fixture:
```typescript
import { test, expect } from './fixtures/screenshot-fixture';

test('my test', async ({ authenticatedPage: page, consoleMonitor }) => {
  // Before screenshot: captured automatically
  await page.goto('/some-page');
  // ... test actions ...
  // After screenshot: captured automatically
});
```

## Console Output
Tests log screenshot paths to console:
```
📸 BEFORE screenshot saved: test-results/screenshots/test-name-before-timestamp.png
📸 AFTER screenshot saved: test-results/screenshots/test-name-after-timestamp.png
❌ FAILURE screenshot saved: test-results/screenshots/test-name-FAILURE-timestamp.png
```

## Review Process
1. After test run, check `test-results/screenshots/`
2. Compare before/after pairs for visual regression
3. Review FAILURE screenshots for debugging
4. Keep for documentation/evidence regardless of test status

## Integration
- **All test files updated**: auth.spec.ts, dashboard.spec.ts, navigation.spec.ts, products-*.spec.ts, smoke.spec.ts
- **Replaces**: `auth.fixture.ts` and `console-fixture.ts` (functionality merged)
- **Compatible with**: Existing test structure (no test code changes needed)

## Future Enhancements
- Screenshot diff comparison
- Selective capture (opt-in/opt-out per test)
- Video recording for complex flows
- Integration with visual regression tools (Percy, Applitools)
