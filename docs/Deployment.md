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
2. Configure GitHub Pages metadata through `actions/configure-pages`
3. Setup Node.js
4. Install dependencies with `npm ci`
5. Run the Vitest suite with `npm run test:run`
6. Build the site with `npm run build`
7. Upload the `dist/` artifact
8. Deploy to GitHub Pages

## Required Repository Setting

GitHub Pages must already be enabled in the repository settings before the deployment step can succeed.

Expected setting:

- Repository Settings
- Pages
- Build and deployment source: GitHub Actions

If that setting has never been enabled, `actions/deploy-pages` can fail with a `404 Not Found` while trying to create the deployment even if the build and artifact upload succeed.

## Rerun Behavior

The workflow uses an artifact name derived from `github.run_id` and `github.run_attempt`.

This avoids a known Pages deployment failure where reruns can leave multiple artifacts named `github-pages` in the same workflow run, causing `actions/deploy-pages` to stop with a duplicate-artifact error.
