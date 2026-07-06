# Troubleshooting

## Embedded game does not render

Some external sources block iframe playback. Use the built-in `Open in a new tab` action on the play page.

## GitHub Pages route looks broken

The app uses hash routing. Production links should look like `#/game/<slug>` rather than relying on server-side route rewrites.

## E2E tests fail before launching

The Playwright configuration uses the installed Microsoft Edge channel by default. Confirm Edge is installed and available on the machine.

## Thumbnails do not load in production

Ensure the manifest thumbnail path is relative, such as `images/example.svg`, so the Vite base path can be applied correctly.

## Runtime feed does not refresh

Confirm both `public/data/games.json` and `public/data/updates.json` are valid JSON and that any new fields still satisfy the `GameEntry` and update feed contracts.

## GitHub Pages deploy fails with 404

If the workflow fails during `actions/deploy-pages` with `Failed to create deployment (status: 404)`, enable GitHub Pages in the repository first:

- Open repository settings
- Open Pages
- Set the build source to `GitHub Actions`

The workflow also expects the standard Pages setup step `actions/configure-pages`, which is included in the repository workflow.

## GitHub Pages deploy fails with multiple artifacts named github-pages

If `actions/deploy-pages` reports that multiple artifacts named `github-pages` were found, the workflow run has more than one Pages artifact attached, usually after reruns.

The repository workflow now uses a unique artifact name per run attempt to prevent that collision. If the failing run was created before this fix, trigger a fresh workflow run instead of rerunning the old one.
