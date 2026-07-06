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
