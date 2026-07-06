# Deployment

## Hosting Target

GitHub Pages is the v1 hosting target.

## Build Assumptions

- The Vite production base path is `/Retro-game-hub/`
- The application uses hash routing to avoid static-host rewrite issues
- Runtime-fed catalog data is served from `public/data/*`

## Workflow

The deployment workflow lives in [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

It performs these steps:

1. Checkout the repository
2. Setup Node.js
3. Install dependencies with `npm ci`
4. Run the Vitest suite with `npm run test:run`
5. Build the site with `npm run build`
6. Upload the `dist/` artifact
7. Deploy to GitHub Pages
