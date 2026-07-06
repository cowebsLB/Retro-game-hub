# Database

## Current State

Retro Game Hub does not use a database in the current release.

## Persistent Data Sources

- `src/data/games.json`: bundled catalog fallback
- `src/data/updates.json`: bundled update fallback
- `public/data/games.json`: runtime catalog mirror
- `public/data/updates.json`: runtime update mirror
- `public/images/*`: cabinet art assets
- browser `localStorage`: cabinet-specific local best records

## Browser Persistence

Current local persistence is intentionally small and device-local:

- `Neon Meteor Run`: best score
- `Skyline Sprint GX`: best distance
- `Memory Vault 84`: best move count

`Pixel Breach` does not currently persist a best-run value.

## Non-Goals in the Current Release

- no user accounts
- no cloud saves
- no shared leaderboard
- no analytics database
- no CMS
