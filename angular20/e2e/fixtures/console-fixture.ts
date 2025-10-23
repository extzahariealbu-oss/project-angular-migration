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
