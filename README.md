# Retro Game Hub

Retro Game Hub is a static React arcade library built for GitHub Pages. Players can browse a retro-styled catalog, filter games by tag or release notes, open a dedicated play page, and launch original in-repo games without leaving the site shell.

## Highlights

- React + Vite + TypeScript single-page app
- Tailwind CSS with custom retro animation styling
- Hash routing for GitHub Pages compatibility
- Runtime-fed catalog and update rail backed by JSON
- Original-only game lineup powered by a reusable local cabinet registry
- Three custom cabinets, including two canvas action games and one puzzle game
- Shared cabinet-shell graphics, richer HUD panels, and stronger game-specific visual identity
- Automated unit, integration, and E2E test coverage
- GitHub Actions Pages deployment workflow

## Stack

- Node.js
- React 19
- TypeScript
- Vite
- Tailwind CSS via `@tailwindcss/vite`
- React Router
- Vitest + Testing Library
- Playwright

## Local Development

### Prerequisites

- Node.js 24 or newer
- npm 11 or newer
- Microsoft Edge installed locally for the default Playwright E2E profile on Windows

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Open `http://localhost:5173/` during local development.

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` runs TypeScript compilation and builds the production site
- `npm run preview` serves the built app locally
- `npm run lint` runs Oxlint
- `npm run test:run` runs the Vitest unit and integration suite once
- `npm run test:e2e` runs the Playwright end-to-end suite

## Game Catalog Contract

Games are sourced from [`src/data/games.json`](src/data/games.json) as the bundled fallback and [`public/data/games.json`](public/data/games.json) as the runtime feed. Each entry follows the `GameEntry` contract:

- `id`
- `title`
- `slug`
- `description`
- `thumbnail`
- `tags`
- `era`
- `players`
- `controls`
- `sourceType`
- `playTarget`
- `featured`
- `status`
- `version`
- `lastUpdated`
- `releaseNotes`

Recent cabinet changes are surfaced through [`public/data/updates.json`](public/data/updates.json) and polled at runtime by the client.

`sourceType` supports:

- `local` for an in-repo playable implementation
- `embed` for an external game loaded in an iframe with fallback open-tab behavior

The current shipped lineup is intentionally `local` only.

## Adding a Game

1. Add or update the game entry in both [`src/data/games.json`](src/data/games.json) and [`public/data/games.json`](public/data/games.json).
2. Add a matching update item to [`public/data/updates.json`](public/data/updates.json) when the change is user-visible.
3. Add matching thumbnail artwork under [`public/images`](public/images).
4. If the game is local, register its implementation in [`src/lib/localGames.tsx`](src/lib/localGames.tsx).
5. Verify the runtime feed still parses and refreshes correctly.
6. Run `npm run test:run`, `npm run build`, and `npm run test:e2e`.

## Deployment

Production builds use the Vite base path `/Retro-game-hub/` so the app resolves correctly on GitHub Pages. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) installs dependencies, runs the Vitest suite, builds the static site, and deploys the `dist/` artifact to GitHub Pages. The app then fetches `public/data` assets at runtime for live catalog refresh behavior.

## Documentation

- [Documentation index](docs/index.md)
- [Architecture](docs/architecture.md)
- [Features](docs/features.md)
- [Installation](docs/installation.md)
- [Testing](docs/Testing.md)
- [Deployment](docs/Deployment.md)
- [Security](docs/Security.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Worklog](docs/worklogs/worklog-06-07-2026.md)

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for the full text.
