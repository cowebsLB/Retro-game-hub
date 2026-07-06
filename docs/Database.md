# Database

## Current State

Retro Game Hub does not use a database in v1.

## Persistent Data

- Game metadata is stored in `src/data/games.json`
- Runtime game metadata is mirrored in `public/data/games.json`
- Runtime update notes are stored in `public/data/updates.json`
- Static artwork is stored under `public/images`
- Individual local cabinets use browser `localStorage` for small single-device records such as best score, best distance, or best move count
- There is no user account storage or backend persistence layer
