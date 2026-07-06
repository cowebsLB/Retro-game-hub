# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

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
