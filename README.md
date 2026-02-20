# Pong Ping

> Local-first desktop app for tracking Ping Pong matches — fast, offline-ready, and keyboard-friendly.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)
![Rust](https://img.shields.io/badge/Rust-stable-orange?logo=rust)
![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react&logoColor=black)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

![App Screenshot](public/home.png)

---

## Features

- **Real-time score tracking** — minimalist, keyboard-driven interface
- **1v1 and 2v2 matches** — full doubles support
- **Player statistics** — win/loss ratios, nemesis tracking, match history
- **Custom game modes** — configure points to win, serve rotation, deuce rules
- **Player profiles** — custom avatars, colors, and nicknames
- **Local-first** — all data in a local SQLite database, no internet required
- **Auto-updates** — integrated update mechanism via GitHub Releases

## Tech Stack

| Layer         | Technology                                        |
| :------------ | :------------------------------------------------ |
| Framework     | [Tauri v2](https://tauri.app/)                    |
| Backend       | Rust + [SQLx](https://github.com/launchbadge/sqlx)|
| Frontend      | React 18 + [Vite](https://vitejs.dev/)            |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/)       |
| Database      | SQLite (local, via `tauri-plugin-sql`)            |
| UI primitives | Radix UI (shadcn-style)                           |

## Getting Started

### Prerequisites

- **Node.js** v24.2.0 (see `.nvmrc`) and [Bun](https://bun.sh/)
- **Rust** (stable) via [rustup](https://rustup.rs/)
- **System dependencies** per OS — see the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/)

### Installation

```bash
git clone https://github.com/your-username/pong-ping.git
cd pong-ping

bun install
cd src-tauri && cargo fetch
```

### Development

Starts the Vite dev server (`:1420`) and the Tauri window with hot-reload:

```bash
bun run tauri dev
```

The SQLite database is created and migrations applied automatically on first launch.

### Production Build

```bash
bun run tauri build
```

Output: `src-tauri/target/release/bundle/` (dmg / exe / deb depending on OS).

## Project Structure

```
pong-ping/
├── src/                    # Frontend (React)
│   ├── components/         # UI components (Dashboard, GameScreen, etc.)
│   ├── services/           # Tauri invoke wrappers (userService, matchService, …)
│   ├── lib/                # Utilities and game config
│   └── App.jsx             # Router entry point
├── src-tauri/              # Backend (Rust)
│   ├── migrations/         # SQL migration files
│   └── src/
│       ├── commands.rs     # Tauri IPC commands
│       ├── models.rs       # Data structs (User, Match, GameMode, …)
│       ├── db.rs           # SQLite pool + migration runner
│       └── lib.rs          # App init + command registration
└── package.json
```

## CI/CD

GitHub Actions (`.github/workflows/release.yml`) builds for Linux and Windows on every `v*` tag and uploads signed bundles to GitHub Releases.

## License

MIT — see [LICENSE](LICENSE).