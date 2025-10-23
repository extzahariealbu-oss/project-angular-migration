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

  warnOnErrors() {
    if (this.hasErrors()) {
      console.warn(`⚠️  ${this.consoleErrors.length} console error(s) detected (test passed anyway):`);
      this.consoleErrors.forEach((error) => {
        console.warn(`   [${error.type}] ${error.text}`);
      });
    }
  }
}
