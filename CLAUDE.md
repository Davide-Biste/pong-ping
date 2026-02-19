# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pong Ping is a local-first desktop app for tracking Ping Pong matches, built with Tauri v2 (Rust backend + React frontend). It supports 1v1 and 2v2 matches, configurable game modes, player statistics, and works fully offline with SQLite storage.

## Commands

```bash
# Development (starts Vite dev server on :1420 + Tauri window with hot-reload)
npm run tauri dev

# Production build (outputs platform-specific bundle to src-tauri/target/release/bundle/)
npm run tauri build

# Frontend only (Vite dev server without Tauri)
npm run dev

# Lint
npm run lint
```

**Prerequisites**: Node v24.2.0 (see `.nvmrc`), Rust stable. Use `npm install` and `cd src-tauri && cargo fetch` for dependencies. Bun lockfile exists (`bun.lock`) — CI uses Bun.

**No test framework is configured** — there are no unit or integration tests.

## Architecture

### Frontend (`src/`)
- **React 18 + Vite + Tailwind CSS v4** with TypeScript/JSX mix
- **Routing** (React Router v6): `/` Dashboard, `/setup` MatchSetup, `/game/:id` GameScreen, `/hall-of-fame` HallOfFame, `/players` PlayerManagement
- **Service layer** (`src/services/`): Thin wrappers around `@tauri-apps/api` invoke calls — `userService.js`, `matchService.js`, `gameModeService.js`
- **UI components** (`src/components/ui/`): Radix UI primitives with shadcn-style wrappers
- **Path alias**: `@/` maps to `./src/`

### Backend (`src-tauri/`)
- **Rust + Tauri v2** with SQLite via SQLx
- `lib.rs` — App init, database setup, registers all Tauri command handlers
- `commands.rs` — All Tauri IPC commands (user CRUD, match lifecycle with point/undo/cancel, statistics, game modes)
- `models.rs` — Data structures: `User`, `GameMode`, `Match`, `MatchEvent`, `PopulatedMatch`, `UserStatistics`
- `db.rs` — SQLite connection pool init and migration runner

### Database
- SQLite with migrations in `src-tauri/migrations/`
- Three tables: `users`, `game_modes`, `matches` (matches store events as JSON)
- Migration 2 added doubles support (`player3_id`, `player4_id`)

### Match Logic
Points are recorded as `MatchEvent` entries with timestamps, stored as JSON in the `matches.events` column. Win detection handles deuce rules (win by 2). Undo pops the last event and recalculates score.

## CI/CD

GitHub Actions (`.github/workflows/release.yml`) triggers on `v*` tags, builds for Linux (ubuntu-22.04) and Windows, uploads bundles to GitHub Releases. Uses Tauri signing keys from secrets.