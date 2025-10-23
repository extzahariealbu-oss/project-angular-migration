# E2E Tests (Playwright)

## Overview
End-to-end tests for Angular 20 demo application using Playwright.

## Test Scenarios
- **Epic 1**: [.knowledge/testing/epic-1-e2e-scenarios.md](file:///workspace/project-angular-migration/.knowledge/testing/epic-1-e2e-scenarios.md)
- **Epic 2**: [.knowledge/testing/epic-2-e2e-scenarios.md](file:///workspace/project-angular-migration/.knowledge/testing/epic-2-e2e-scenarios.md)

## Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View HTML report
npm run test:e2e:report
```

## Prerequisites
- Backend running on `http://localhost:8000`
- Test user exists: `{ username: "test", password: "test123" }`

## Test Structure
```
e2e/
├── fixtures/
│   └── auth.fixture.ts    # Authentication helpers
├── auth.spec.ts           # Epic 1: Login/Logout
├── guards.spec.ts         # Epic 1: Route protection
├── layout.spec.ts         # Epic 1: Header/Sidebar
├── dashboard-loading.spec.ts  # Epic 2: Initial load
├── date-filter.spec.ts    # Epic 2: Date range picker
├── stat-boxes.spec.ts     # Epic 2: 4 widgets
└── ca-graph.spec.ts       # Epic 2: Bar chart
```

## Test Execution
- **Sequential**: Tests run one at a time to avoid session conflicts
- **Workers**: 1 (single browser instance)
- **Retries**: 0 locally, 2 in CI

## Evidence-Based Testing
All tests implement scenarios from evidence documents extracted from AngularJS reference application.
