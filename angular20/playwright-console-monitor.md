# Playwright Console Error Monitoring Setup

This guide shows how to capture and monitor console errors in Playwright E2E tests for Angular 20, with automatic clearing between tests.

## 1. Console Monitor Utility

Create the following file to handle console monitoring:

**File: `e2e/utils/console-monitor.ts`**

```typescript
import { Page } from '@playwright/test';

export interface ConsoleMessage {
  type: string;
  text: string;
  location?: string;
}

export class ConsoleMonitor {
  private consoleMessages: ConsoleMessage[] = [];
  private consoleErrors: ConsoleMessage[] = [];

  constructor(private page: Page) {}

  startMonitoring() {
    this.page.on('console', (msg) => {
      const message: ConsoleMessage = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location().url
      };

      this.consoleMessages.push(message);

      // Capture errors and warnings
      if (msg.type() === 'error' || msg.type() === 'warning') {
        this.consoleErrors.push(message);
      }
    });

    // Capture page errors (uncaught exceptions)
    this.page.on('pageerror', (error) => {
      this.consoleErrors.push({
        type: 'pageerror',
        text: error.message,
        location: error.stack
      });
    });
  }

  getErrors(): ConsoleMessage[] {
    return this.consoleErrors;
  }

  getAllMessages(): ConsoleMessage[] {
    return this.consoleMessages;
  }

  hasErrors(): boolean {
    return this.consoleErrors.length > 0;
  }

  clear() {
    this.consoleMessages = [];
    this.consoleErrors = [];
  }

  printErrors() {
    if (this.hasErrors()) {
      console.log('\n🔴 Console Errors Found:');
      this.consoleErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. [${error.type}] ${error.text}`);
        if (error.location) {
          console.log(`   Location: ${error.location}`);
        }
      });
    }
  }
}
```

## 2. Test Fixture

Create a fixture that automatically sets up and clears console monitoring for each test:

**File: `e2e/fixtures/console-fixture.ts`**

```typescript
import { test as base, expect } from '@playwright/test';
import { ConsoleMonitor } from '../utils/console-monitor';

type ConsoleFixtures = {
  consoleMonitor: ConsoleMonitor;
};

export const test = base.extend<ConsoleFixtures>({
  consoleMonitor: async ({ page }, use) => {
    const monitor = new ConsoleMonitor(page);
    monitor.startMonitoring();
    
    await use(monitor);
    
    // After each test, check for errors and clear
    if (monitor.hasErrors()) {
      monitor.printErrors();
    }
    
    monitor.clear();
  },
});

export { expect };
```

## 3. Usage in Tests

Use the console monitor in your test files:

**File: `e2e/app.spec.ts`**

```typescript
import { test, expect } from './fixtures/console-fixture';

test.describe('Application Tests', () => {
  test('should navigate to home page without console errors', async ({ page, consoleMonitor }) => {
    await page.goto('/');
    
    // Your test assertions
    await expect(page.locator('h1')).toBeVisible();
    
    // Assert no console errors
    expect(consoleMonitor.hasErrors()).toBe(false);
  });

  test('should handle form submission without errors', async ({ page, consoleMonitor }) => {
    // Console is automatically cleared from previous test
    await page.goto('/form');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Check for errors
    const errors = consoleMonitor.getErrors();
    expect(errors).toHaveLength(0);
  });

  test('should allow specific console warnings', async ({ page, consoleMonitor }) => {
    await page.goto('/some-page');
    
    // Filter out expected warnings
    const errors = consoleMonitor.getErrors().filter(
      error => !error.text.includes('Expected warning message')
    );
    
    expect(errors).toHaveLength(0);
  });
});
```

## How It Works

1. **ConsoleMonitor** listens to browser console events and page errors
2. **Test fixture** automatically initializes the monitor before each test
3. **After each test**, errors are printed and the console is cleared
4. **Tests remain isolated** - each test starts with a clean console state

## Key Features

- ✅ Captures all console messages (log, error, warning, etc.)
- ✅ Captures uncaught page exceptions
- ✅ Automatically clears between tests
- ✅ Detailed error reporting with location information
- ✅ Flexible error assertions and filtering