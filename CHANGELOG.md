# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [0.4.0] - 2026-07-06

### Added

- Added a reusable local cabinet registry so the hub can ship multiple original in-repo games behind the shared play-page shell.
- Added `Skyline Sprint GX`, a custom lane-runner cabinet with boost management and persistent best-distance tracking.
- Added `Memory Vault 84`, a custom puzzle cabinet with a mirrored glyph grid and best-move persistence.

### Changed

- Replaced all third-party archive and embed catalog entries with an original-only lineup.
- Updated catalog, hero, and play-page copy to position the site as a library of custom cabinets instead of mixed-source embeds.
- Expanded automated coverage to validate the local game registry and the new cabinet routes.
- Reworked all shipped cabinets with a stronger visual presentation, including shared cabinet chrome, richer HUD treatments, better canvas effects, and a cleaned-up `Memory Vault 84` glyph set.

### Fixed

- Removed corrupted text encoding from runtime content, card UI, and the new game surfaces so cabinet copy renders correctly.
- Added direct route coverage for `Pixel Breach` in both the integration and E2E suites.

## [0.3.0] - 2026-07-06

### Added

- Upgraded `Neon Meteor Run` into a canvas-driven showcase cabinet with pulse attacks, shield pickups, wave scaling, combo scoring, and persistent best-score tracking.
- Added a runtime-fed arcade manifest and update rail sourced from `public/data/games.json` and `public/data/updates.json`.
- Added release-note, version, and last-updated metadata to the `GameEntry` contract and surfaced those details across catalog and play pages.

### Changed

- Expanded catalog search to match cabinet version text and release notes.
- Improved external cabinet play pages with live status notes and always-available open-tab recovery.

### Fixed

- Updated the GitHub Pages workflow to include the standard Pages configuration step and documented the required repository Pages setting for successful deployments.
- Updated the Pages workflow to use a unique artifact name per workflow attempt so reruns do not fail with duplicate `github-pages` artifacts.

## [0.2.0] - 2026-07-06

### Added

- Built the first Retro Game Hub release as a React + Vite + TypeScript GitHub Pages app.
- Added a manifest-driven game catalog with featured game support, search, tag filtering, and hash-routed play pages.
- Added a local playable arcade game and embedded external cabinet support with open-tab fallback handling.
- Added Tailwind-based styling, custom retro animation effects, and custom SVG thumbnail artwork.
- Added Vitest unit/integration coverage, Playwright E2E coverage, and a GitHub Actions Pages deployment workflow.
- Added project documentation for architecture, installation, features, API contract, testing, deployment, troubleshooting, security, and roadmap tracking.

## [0.1.1] - 2026-07-06

### Fixed

- Normalized the Apache 2.0 license URLs in `LICENSE` to the canonical `https` endpoints.
