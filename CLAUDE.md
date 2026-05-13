# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

R3PLAYX is a third-party NetEase Cloud Music player built with React + Electron. It's a cross-platform desktop application that also has a web version. The project uses a monorepo architecture with Turborepo for build orchestration.

**Key Technologies:**
- **Desktop:** Electron 28, React 18, Fastify (local server), better-sqlite3
- **Web:** React 18, Vite 4, Tailwind CSS, Framer Motion
- **Server:** Fastify 4, Prisma, SQLite
- **Build:** Turborepo, PNPM workspaces

## Development Setup

### Prerequisites
- Node.js >= 16.0.0 (v18.12.1 recommended)
- PNPM package manager (v8.6.12)

### Initial Setup
```bash
# Install pnpm (if not already installed)
npm i -g pnpm

# Set electron mirror (for China users)
pnpm config set electron_mirror=https://repo.huaweicloud.com/electron/

# Copy environment files
cp .env.example .env

# Install dependencies (runs post-install scripts automatically)
pnpm install
```

**Important:** The root `pnpm install` automatically runs `post-install` scripts in parallel, which:
- Builds SQLite binaries for desktop (better-sqlite3)
- Generates Prisma client for server

### Development Commands

**Desktop App (Electron):**
```bash
# Run desktop app in development mode
pnpm dev

# Build desktop app
pnpm build

# Package desktop app for distribution
pnpm package

# Test package (no installer, for quick testing)
pnpm pack:test
```

**Web App:**
```bash
# Run web app in development mode
pnpm run dev --filter web

# Build for production
pnpm build:web

# Preview production build
pnpm preview
```

**Server:**
```bash
# Run server in development mode (builds and starts on port 35530)
pnpm run dev --filter server

# Build server
pnpm run build --filter server

# Run standalone NetEase API server (for development)
pnpm run api:netease --filter web
```

**Testing:**
```bash
# Run tests for a specific package
pnpm test --filter <package-name>

# Run tests with UI
pnpm test:ui --filter <package-name>

# Type checking
pnpm test:types --filter <package-name>
```

**Code Quality:**
```bash
# Lint all code
pnpm lint

# Format all code
pnpm format
```

## Architecture

### Monorepo Structure

```
music/
├── packages/
│   ├── desktop/      # Electron desktop app (main process + preload + local server)
│   ├── server/       # Standalone backend API server (Fastify + Prisma)
│   ├── shared/       # Shared types, interfaces, and utilities
│   └── web/          # React web app (Vite + React)
├── .env             # Environment variables (root)
├── turbo.json       # Turborepo configuration
└── pnpm-workspace.yaml  # PNPM workspace configuration
```

### Communication Architecture

The application follows a **client-server architecture** with different communication patterns:

1. **Desktop App:**
   - **Renderer Process (React UI)** ←→ **Main Process (Electron)** via IPC channels
   - **Renderer Process** ←→ **Local Fastify Server** (localhost:42710) via HTTP
   - **Main Process** runs a local Fastify server on port 42710
   - **Main Process** runs NetEase API server on port 30001 (development)

2. **Web App:**
   - **React UI** ←→ **Standalone Server** (port 35530) via HTTP
   - Uses HashRouter for client-side routing

3. **Server (Desktop & Standalone):**
   - **Fastify** ←→ **NetEase Music API** (proxied via @neteasecloudmusicapienhanced/api)
   - **Fastify** ←→ **Apple Music API**
   - **Fastify** ←→ **@unblockneteasemusic/server** (bypass geo-restrictions)
   - **Prisma** ←→ **SQLite database**

### IPC Communication (Electron)

IPC channels are defined in `packages/shared/IpcChannels.ts`. This file contains:
- `IpcChannels` enum: Channel names for communication
- `IpcChannelsParams`: TypeScript interface for parameter types
- `IpcChannelsReturns`: TypeScript interface for return types

**Common IPC operations:**
- Window controls: `Minimize`, `MaximizeOrUnmaximize`, `Close`
- Playback controls: `Play`, `Pause`, `PlayOrPause`, `Next`, `Previous`
- Data sync: `SyncProgress`, `SyncSettings`, `SyncTheme`
- API caching: `GetApiCache`, `ClearAPICache`
- Apple Music integration: `GetAlbumFromAppleMusic`, `GetArtistFromAppleMusic`

### State Management

- **Server State:** TanStack React Query (@tanstack/react-query) for API data fetching
- **Client State:** Valtio (reactive state management) for UI state
- **Local Storage:** electron-store (desktop), localStorage/cookies (web)
- **Database:** SQLite with better-sqlite3 (desktop), Prisma (server)

**Key state files:**
- `packages/web/states/player.ts` - Player state (persisted to localStorage)
- `packages/web/states/uiStates.ts` - UI state (non-persisted)
- `packages/web/states/settings.ts` - User settings (persisted)
- `packages/web/states/persistedUiStates.ts` - Persisted UI state
- `packages/web/states/contextMenus.ts` - Context menu state

### Key Directories

**packages/desktop/**
- `main/` - Electron main process code
  - `appServer/` - Local Fastify server and routes
  - `ipcMain.ts` - IPC channel handlers
  - `db.ts` - SQLite database operations
  - `cache.ts` - API cache management
  - `keyboardShortcuts.ts` - Global keyboard shortcuts
  - `store.ts` - electron-store configuration
- `preload/` - Preload scripts for secure IPC
- Scripts: `build.main.ts`, `build.sqlite3.ts`

**packages/server/**
- `src/routes/` - API route handlers
  - `netease/` - NetEase Music API endpoints
  - `apple-music/` - Apple Music integration
- `src/plugins/` - Fastify plugins
- `prisma/` - Database schema and migrations

**packages/web/**
- `components/` - React components
- `pages/` - Page components (routing)
  - `My`, `Discover`, `Browse`, `Album`, `Playlist`, `Artist`, `Search`, `Settings`, `Lyrics`
- `hooks/` - Custom React hooks
- `states/` - Valtio state stores
- `i18n/` - Internationalization files (supports zh-CN, en-US)
- `styles/` - CSS and Tailwind styles
- `utils/` - Utility functions, player logic, React Query client

**packages/shared/**
- `api/` - Shared API interfaces
- `db/` - Database models
- `interface.d.ts` - Core TypeScript interfaces (Track, Album, Artist, Playlist, User, etc.)
- `IpcChannels.ts` - IPC channel definitions
- `AppleMusic.ts` - Apple Music integration types

## Environment Variables

**Root `.env`:**
- `ELECTRON_WEB_SERVER_PORT` - Local Fastify server port (default: 42710)
- `ELECTRON_DEV_NETEASE_API_PORT` - NetEase API port (default: 30001)
- `VITE_APP_NETEASE_API_URL` - NetEase API URL path (default: /netease)

## Build Pipeline

The project uses Turborepo for efficient builds:

1. **Dependency Management:** `turbo.json` defines build order with `dependsOn`
2. **Caching:** Disabled for most tasks in development (see `turbo.json`)
3. **Parallel Execution:** Development tasks run in parallel
4. **Outputs:** Build artifacts in `dist/` directories

**Build Order:**
1. `shared` package (no dependencies)
2. `server` and `web` (depend on `shared`)
3. `desktop` (depends on `shared`, `server`, `web`)

## Working with Code

### Adding New IPC Channels

When adding new IPC communication:
1. Update `packages/shared/IpcChannels.ts`:
   - Add channel name to enum
   - Add parameter type to `IpcChannelsParams`
   - Add return type to `IpcChannelsReturns`
2. Implement handler in `packages/desktop/main/`
3. Use in renderer via preload bridge

### Shared Types

All shared TypeScript interfaces are in `packages/shared/interface.d.ts`:
- `Track`, `Album`, `Artist`, `Playlist` - Music data structures
- `User` - User profile
- `Video` - Music video data
- `KeyboardShortcuts` - Keyboard shortcut settings

### Testing

- **Unit Tests:** Vitest (configured in each package)
- **Type Checking:** `tsc --noEmit` via `test:types` script
- **Test UI:** `vitest --ui` for visual test runner
- **Coverage:** `vitest run --coverage`

### Code Style

- **ESLint:** Configured at root with TypeScript support
- **Prettier:** Code formatting with Tailwind CSS plugin
- **TypeScript:** Strict mode enabled

## Common Patterns

### API Calls (Desktop)
The desktop app runs a local Fastify server that proxies requests to external APIs. Routes are defined in `packages/desktop/main/appServer/routes/`.

### Database Operations
- Desktop: Direct SQLite access via better-sqlite3 (`packages/desktop/main/db.ts`)
- Server: Prisma ORM with migrations in `packages/server/prisma/`

### Internationalization
i18next configuration in `packages/web/i18n/`. Translation files follow the standard i18next pattern with `zh-CN` and `en-US` support.

### Routing
- Desktop & Web use **HashRouter** from react-router-dom
- Routes are defined in `packages/web/components/Router.tsx`
- Lazy loading with React.lazy for code splitting
- AnimatePresence (Framer Motion) for route transitions

### Player Architecture
- Player logic in `packages/web/utils/player.ts`
- Uses Howler.js for audio playback
- State persisted to localStorage via Valtio proxy
- Supports multiple audio quality levels (h/m/l)

### Virtual Scrolling
- Uses react-virtuoso for efficient list rendering
- Custom ImageManager class for preloading and caching images
- Key configuration in `packages/web/components/CoverRowVirtual.tsx`:
  - `overscan={2400}` - Pre-renders ~7-8 rows outside viewport
  - `increaseViewportBy={{ top: 3200, bottom: 3200 }}` - Extends viewport by ~10 rows
  - Initial preload: 48 items (12 rows) to reduce white screen during fast scrolling
- Images use lazy loading with skeleton placeholders and fade-in animation

## Platform-Specific Considerations

**Keyboard Shortcuts:** Defined per platform in `KeyboardShortcutSettings`:
- `darwin` - macOS
- `win32` - Windows
- `linux` - Linux

**Packaging:** Electron Builder configuration in `packages/desktop/.electron-builder.config.js`

## Important Notes

- The project is in **Beta** stage (v2.7.6)
- API source code from [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) (enhanced version)
- Uses @unblockneteasemusic/server to bypass NetEase geo-restrictions
- Licensed under AGPL - derivative works must mention this project

## Resources

- [Developer Wiki](https://github.com/Sherlockouo/music/wiki/For-Developers)
- [GitHub Repository](https://github.com/Sherlockouo/music)
- [Live Demo](https://music.xtify.top/)
