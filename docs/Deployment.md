# Deployment

## Hosting Target

Retro Game Hub ships as a static GitHub Pages site.

## Production Assumptions

- Vite base path: `/Retro-game-hub/`
- route model: hash routing
- deploy workflow: `.github/workflows/deploy.yml`
- artifact source: `dist/`

## GitHub Pages Repository Setting

The repository must have GitHub Pages enabled before deployment can succeed.

Required setting:

- Repository Settings
- Pages
- Build and deployment source: `GitHub Actions`

Without that setting, `actions/deploy-pages` can fail with a `404 Not Found` even when build and artifact upload succeed.

## Workflow Steps

The checked-in workflow performs:

1. checkout
2. Pages configuration
3. Node 24 setup
4. dependency install with `npm ci`
5. unit and integration tests with `npm run test:run`
6. production build with `npm run build`
7. Pages artifact upload
8. Pages deployment

## Artifact Naming

The workflow uses a unique Pages artifact name derived from:

- `github.run_id`
- `github.run_attempt`

This avoids the duplicate-artifact failure that can happen when older runs are rerun.

## Recommended Release Checklist

1. Run `npm run lint`
2. Run `npm run test:run`
3. Run `npm run build`
4. Run `npm run test:e2e`
5. Confirm docs and worklog updates are committed
6. Push to `main`
7. Verify the Pages workflow succeeds
8. Open the published site and test `#/` plus at least one `#/game/:slug` route

## Known GitHub Actions Notes

- GitHub currently emits Node 20 deprecation warnings for some first-party actions.
- Those warnings do not come from this app runtime and do not change the deployed site behavior.
