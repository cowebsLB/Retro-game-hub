# Architecture

## System Shape

Retro Game Hub is a static single-page application deployed to GitHub Pages. It has no backend, no API server, and no database. The app relies on a bundled manifest for build-time safety and mirrors that content through runtime JSON so metadata can refresh without changing the application shell.

## Core Stack

- React 19 for UI composition
- Vite 8 for development and production builds
- TypeScript for contracts and route-safe component logic
- React Router hash routing for static-host compatibility
- Tailwind CSS plus custom CSS for cabinet framing, glow effects, scanlines, and motion
- Vitest and Playwright for verification

## Route Model

- `#/` renders the home page, featured cabinet, live update rail, filters, and catalog
- `#/game/:slug` renders an individual cabinet play page
- unmatched routes render the not-found state

Hash routes are intentional because GitHub Pages does not provide server-side rewrites for SPA paths.

## Runtime Flow

1. `src/App.tsx` creates the shell and route tree.
2. `src/hooks/useArcadeFeed.ts` boots from bundled JSON and then requests the runtime JSON feeds in `public/data`.
3. `src/lib/games.ts` validates manifest and update payloads before they enter UI state.
4. `src/routes/HomePage.tsx` renders the hero, update rail, filter bar, and cabinet grid.
5. `src/routes/GamePage.tsx` resolves the active cabinet by slug and renders metadata plus the play surface.
6. `src/components/GamePlayer.tsx` decides how to render the playable surface for the selected entry.
7. `src/lib/localGames.tsx` maps `playTarget` ids to local cabinet implementations.

## Content Architecture

### Bundled Fallback

- `src/data/games.json`
- `src/data/updates.json`

These files are imported into the app build so the hub always has a known-good baseline.

### Runtime Mirror

- `public/data/games.json`
- `public/data/updates.json`

These files are fetched on a 60-second interval. If runtime fetch fails, the app keeps using the bundled state.

### Art Assets

- `public/images/*`
- `docs/assets/screenshots/*`

The cabinet thumbnails and documentation screenshots are static assets committed in-repo.

## Cabinet Architecture

The current release uses a single delivery path in practice:

- `local`: original cabinet implementations that live under `src/games`

The wider type system still supports `embed`, but the present product direction is intentionally original-only.

Each local cabinet is responsible for:

- rendering its own play surface
- exposing its own HUD and control messaging
- handling browser-local persistence where needed

## Persistence Model

There is no server persistence. Small per-device records use `localStorage`, such as:

- best score in `Neon Meteor Run`
- best distance in `Skyline Sprint GX`
- best move count in `Memory Vault 84`

## Deployment Model

- host: GitHub Pages
- base path: `/Retro-game-hub/`
- publish artifact: Vite `dist/`
- workflow: `.github/workflows/deploy.yml`

The workflow runs tests, builds the static app, uploads the Pages artifact, and deploys it through the GitHub Pages Actions flow.
