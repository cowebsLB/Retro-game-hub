# Features

## Current Product Features

- Retro-styled landing page with featured cabinet hero
- Searchable and filterable cabinet catalog
- Runtime update rail for recent cabinet and release changes
- Minute-level live sync freshness label for the runtime feed
- Dedicated cabinet routes with metadata, controls, and release notes
- Original-only local game lineup with shared hub shell and per-cabinet visual identity
- Responsive desktop and mobile layouts
- On-screen touch controls for the canvas-based action cabinets
- Hash routing compatible with GitHub Pages

## Catalog Features

- text search across title, description, era, players, tags, version, and release notes
- tag-based filtering
- featured cabinet promotion
- manifest-driven status badges
- runtime sync state indicator
- manifest-backed card rendering

## Cabinet Lineup

| Cabinet | Type | Highlights | Persistence |
| --- | --- | --- | --- |
| `Neon Meteor Run` | Survival dodge cabinet | pulse burst, meteor escalation, spark combo chain, shield pickup | best score |
| `Skyline Sprint GX` | Reflex lane runner | lane switching, boost charge, traffic pressure, energy cells | best distance |
| `Memory Vault 84` | Puzzle cabinet | mirrored glyph pairs, animated flip cards, move-count pressure | best moves |
| `Pixel Breach` | Shooter cabinet | enemy formations, auto-fire lane control, wave escalation, shield pickups | best score |

## Mobile Interaction

- `Memory Vault 84` remains tap-native because the core game uses button-based card interaction.
- `Neon Meteor Run`, `Skyline Sprint GX`, and `Pixel Breach` now ship with on-screen touch controls on small screens.
- Desktop keyboard controls remain available unchanged for all action cabinets.

## Visual Features

- cabinet-shell framing and marquees
- scanline, glow, and CRT-inspired treatments
- custom thumbnail artwork
- game-specific HUD cards and accent systems
- animated hero lighting and hover treatment

## Documentation and Ops Features

- semantic-versioned changelog
- dated implementation worklogs
- GitHub Pages deployment automation
- unit, integration, and end-to-end verification

## Current Limits

- no user accounts
- no backend saves
- no multiplayer
- no favorites or rating system
- no true live backend feed; runtime refresh still reads static JSON
