# Troubleshooting

## GitHub Pages deploy fails with `404 Not Found`

Cause:

- GitHub Pages is not enabled for the repository
- Pages is not configured to deploy from `GitHub Actions`

Fix:

1. Open repository settings
2. Open Pages
3. Set the build source to `GitHub Actions`
4. Trigger a fresh workflow run

## GitHub Pages deploy fails with duplicate `github-pages` artifacts

Cause:

- an older workflow run was rerun after multiple Pages artifacts already existed

Fix:

- trigger a fresh workflow run instead of rerunning the stale failed run
- keep the current checked-in artifact naming logic in place

## Direct route looks broken in production

Cause:

- the app uses hash routing by design

Fix:

- use `#/game/<slug>` links, not server-style path routing

## Local E2E tests fail to launch a browser

Cause:

- Playwright is configured against the installed Edge channel on this machine
- Edge may be missing or not discoverable

Fix:

- install Microsoft Edge
- rerun `npm run test:e2e`

## Runtime feed looks stale

Cause:

- `public/data/games.json` or `public/data/updates.json` was not updated
- runtime payloads became invalid and the app stayed on the bundled fallback

Fix:

- validate both JSON files
- ensure schema fields match the current contracts
- reload the page and confirm the sync state updates

## Thumbnails do not load in production

Cause:

- the manifest path does not resolve cleanly under the GitHub Pages base path

Fix:

- keep asset paths relative, such as `images/pixel-breach.jpg`

## UI text shows corrupted characters

Cause:

- source files or JSON content were saved with the wrong encoding or corrupted punctuation

Fix:

- normalize user-facing copy to clean UTF-8 or ASCII-safe text
- rebuild and spot-check the affected route
