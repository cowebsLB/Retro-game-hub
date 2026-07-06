# Architecture

## Application Shape

Retro Game Hub is a static single-page application. It uses:

- React for component composition
- Vite for local development and static production builds
- TypeScript for component, route, and manifest typing
- Tailwind CSS plus custom CSS for layout, typography, and arcade-style animation
- React Router with hash routing for GitHub Pages compatibility

## Runtime Flow

1. `src/App.tsx` creates the shell and route tree.
2. `src/hooks/useArcadeFeed.ts` starts from bundled JSON and then polls runtime JSON feeds under `public/data`.
3. `src/lib/games.ts` parses bundled and runtime payloads into validated `GameEntry` and `GameUpdate` objects.
4. `src/routes/HomePage.tsx` renders the featured cabinet, runtime sync state, update rail, search/filter controls, and catalog grid.
5. `src/routes/GamePage.tsx` resolves a game from the route slug and renders metadata, release notes, and the correct player surface.
6. `src/components/GamePlayer.tsx` chooses between the local play surface and the embedded iframe path.

## Content Model

The game catalog is versioned in-repo. There is still no backend, but the app now fetches runtime JSON from `public/data` so catalog entries and update notes can refresh independently of the bundled import fallback.

## Deployment Model

The site is deployed as a static artifact through GitHub Pages. Vite production builds use the repository base path `/Retro-game-hub/`.
