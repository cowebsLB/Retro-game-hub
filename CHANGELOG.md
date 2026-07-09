# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [0.4.4] - 2026-07-09

### Added

- Added mobile E2E coverage for drag, swipe, narrow-viewport overflow, and screenshot-backed cabinet checks.

### Changed

- Replaced mobile direction buttons with direct playfield gestures: drag steering in `Neon Meteor Run`, swipe or lane taps in `Skyline Sprint GX`, and drag-to-move auto-fire in `Pixel Breach`.
- Reduced mobile action docks to game-specific actions such as Pulse and Boost.

### Fixed

- Fixed negative offscreen vehicle and pickup scales that could crash the `Skyline Sprint GX` canvas renderer.
- Added pointer-capture fallbacks so in-bounds gestures still work when capture is unavailable.

## [0.4.3] - 2026-07-09

### Added

- Added a shared mobile touch-control dock for local action cabinets.
- Added regression coverage that verifies the touch-control surfaces render on the shipped action game routes.

### Changed

- Updated `Neon Meteor Run`, `Skyline Sprint GX`, and `Pixel Breach` to expose on-screen touch controls for mobile play.
- Updated release documentation to describe the new mobile interaction model and verification coverage.

## [0.4.2] - 2026-07-09

### Added

- Added regression coverage for the live sync pill refresh behavior and featured cabinet status rendering.

### Changed

- Updated the home page sync pill to refresh its relative time label between feed polls.
- Updated the featured hero card to render the cabinet status directly from manifest data.

### Fixed

- Fixed frame-rate-dependent meteor movement in `Neon Meteor Run` so gameplay speed stays time-based.
- Fixed `Pixel Breach` wave intro messaging so later waves show their intro banner again.
- Fixed remaining corrupted sync pill text on the home page.

## [0.4.1] - 2026-07-06

### Added

- Added screenshot-backed documentation assets for the current home, catalog, desktop cabinet, and mobile cabinet views.
- Added a production-grade README with badges, cabinet lineup details, setup guidance, deployment notes, and links to the full docs set.

### Changed

- Rewrote the core docs pages so architecture, features, installation, testing, deployment, API, database, security, roadmap, and troubleshooting match the live application.
- Expanded the current worklogs with the documentation refresh, screenshot capture, and verification results.

### Fixed

- Fixed remaining corrupted user-facing text on the home and play routes so the shipped UI and captured screenshots render cleanly.
- Corrected documentation drift around the active cabinet count, runtime update contract, and current original-only delivery model.

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
