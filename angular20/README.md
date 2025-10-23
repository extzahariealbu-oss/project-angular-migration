# Angular 20 CRM Demo

## Overview
Greenfield Angular 20 demo application running side-by-side with AngularJS reference app, built using modern standalone components and signals.

**Project**: Angular 20 Greenfield Demo  
**Framework**: Angular 20 with standalone components (no NgModules)  
**Status**: Epic 0 Complete - Foundation Bootstrap  

## Prerequisites
- **Podman & Podman Compose** - for backend services
- **VS Code** with Remote-Containers extension
- **NO Node.js/npm required on host** - all development happens inside Dev Container

## Quick Start

### Step 1: Start Backend Services
```bash
# From project root (project-angular-migration/)
cd angularjs2
podman compose up -d

# Verify AngularJS reference app: http://localhost:8000
# Verify MongoDB running on port 27017
```

### Step 2: Open Angular 20 in Dev Container
```bash
# In VS Code:
# 1. File > Open Folder > select project-angular-migration/angular20/
# 2. Click "Reopen in Container" when prompted
# 3. Wait for container to build (first time only)
# 4. Extensions will auto-install inside container
```

### Step 3: Start Angular Dev Server (Inside Container)
```bash
# Inside VS Code terminal (runs in container automatically):
ng serve

# Or use npm script with proxy:
npm start

# Access Angular 20 app: http://localhost:4200
```

## Architecture

### Side-by-Side Deployment
- **AngularJS Reference**: http://localhost:8000 (Total.js backend + AngularJS frontend)
- **Angular 20 Demo**: http://localhost:4200 (modern Angular, shares same backend)
- **Backend API**: Total.js on port 8000 (`/erp/api/*`)
- **Database**: MongoDB on port 27017

### Dev Container Setup
All development happens inside a containerized environment:
- **Base Image**: Node.js 20 (Debian Bookworm)
- **Tools**: Angular CLI, npm, git
- **Mount**: Entire `ampcode-projects/` directory at `/workspace`
- **Network**: Connects to `app-network` to access backend services
- **Port**: 4200 forwarded to host

## Project Structure

```
src/app/
├── core/               # Singleton services, guards, interceptors
│   ├── models/        # TypeScript interfaces
│   ├── services/      # API services
│   ├── guards/        # Route guards
│   └── interceptors/  # HTTP interceptors
├── shared/            # Shared components, directives, pipes
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/          # Feature modules (lazy-loaded)
│   ├── home/         # Welcome page
│   └── not-found/    # 404 handler
├── layout/            # Layout shell components
├── app.ts            # Root component
├── app.html          # Shell layout
├── app.scss          # Global styles
├── app.config.ts     # App configuration
└── app.routes.ts     # Route definitions
```

### Path Aliases
```typescript
@core/*     → src/app/core/*
@shared/*   → src/app/shared/*
@features/* → src/app/features/*
@layout/*   → src/app/layout/*
```

## Development (Inside Dev Container)

### Build Commands
```bash
ng build                                # Development build
ng build --configuration production     # Production build
```

### Dev Server
```bash
ng serve                                # Dev server on port 4200
npm start                               # With API proxy enabled
npm run start:prod                      # Production mode with proxy
```

### Testing
```bash
ng test                                 # Unit tests
ng test --watch=false                   # Run once
ng test --code-coverage                 # With coverage report
```

### Linting
```bash
ng lint                                 # ESLint
```

## API Configuration

### Development Mode
Angular dev server proxies API requests to Total.js backend:
- **Proxy Config**: `proxy.conf.json`
- **API Base**: `/erp/api/*` → `http://localhost:8000/erp/api/*`
- **No CORS issues** - proxy handles cross-origin requests

### Environment Files
- `src/environments/environment.development.ts` - Dev settings
- `src/environments/environment.ts` - Production settings

## Technology Stack

### Framework & Language
- **Angular**: 20 (latest)
- **TypeScript**: Strict mode enabled
- **Standalone Components**: No NgModules

### Styling
- **Preprocessor**: SCSS
- **Approach**: Component-scoped styles

### Routing
- **Router**: Angular Router with lazy loading
- **Strategy**: Hash-based (for side-by-side deployment)

### State Management
- **RxJS**: Observable streams
- **Signals**: Angular signals (modern reactivity)

### Build System
- **Builder**: esbuild (Angular CLI default)
- **Dev Server**: Vite-based (Angular 20)

## Performance Baseline

**Production Build** (Epic 0 Complete):
- **Build Time**: ~28 seconds (cold build in container)
- **Initial Bundle**: 231.28 kB raw / 66.53 kB gzipped
- **Main Bundle**: 1.70 kB (738 bytes gzipped)
- **Polyfills**: 34.59 kB (11.33 kB gzipped)
- **Lazy Chunks**: ~1-2 kB per feature

## Dev Container Benefits

✅ **Zero local Node.js/npm installation**  
✅ **Consistent environment across team**  
✅ **All tools pre-installed** (Angular CLI, TypeScript, etc.)  
✅ **VS Code extensions auto-installed in container**  
✅ **Agent commands run directly** (no `podman exec` prefix needed)  
✅ **Hot reload and debugging work seamlessly**  
✅ **Host machine stays clean**  

## Available URLs

When both applications are running:
- **Angular 20 Demo**: http://localhost:4200 (this app)
- **AngularJS Reference**: http://localhost:8000 (legacy app)
- **Backend API**: http://localhost:8000/erp/api/* (Total.js)
- **MongoDB**: mongodb://localhost:27017 (database)

## Next Steps

Epic 0 complete! Ready for:
- **Epic 1**: Foundation Infrastructure (HTTP client, auth interceptor, error handling)
- **Epic 2**: Product Management (product list, details, CRUD operations)
- Feature implementation begins

## Troubleshooting

### Container won't build
```bash
# Rebuild container from scratch
podman compose -f .devcontainer/podman-compose.yml down
podman compose -f .devcontainer/podman-compose.yml build --no-cache
```

### Backend API not reachable
```bash
# Verify backend is running
cd angularjs2
podman compose ps

# Check network connectivity
podman network inspect project-angular-migration_app-network
```

### Port already in use
```bash
# Stop conflicting services
podman compose -f .devcontainer/podman-compose.yml down
cd angularjs2 && podman compose down
```

## Documentation

- **Project Knowledge Base**: `../.knowledge/`
- **Epic Details**: `../.knowledge/epics/epic-0-bootstrap.md`
- **Architecture**: `../.knowledge/architecture.md`
- **Migration Strategy**: `../.knowledge/migration-strategy.md`

## Contributing

All development follows the parent project guidelines:
- **XAI**: Explain all reasoning
- **Evidence-Based**: Every decision traces to proof
- **Session-Based Commits**: Commits happen at topic boundaries
- **KB Maintenance**: Document patterns and decisions

See `../AGENT.md` for complete agent configuration and guidelines.
