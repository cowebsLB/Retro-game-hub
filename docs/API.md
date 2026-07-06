# API Contract

## Public Content Interface

The application does not expose a network API in v1. Its primary public contract is the `GameEntry` manifest schema used by `src/data/games.json`.

## GameEntry

- `id: string`
- `title: string`
- `slug: string`
- `description: string`
- `thumbnail: string`
- `tags: string[]`
- `era: string`
- `players: string`
- `controls: string[]`
- `sourceType: "local" | "embed"`
- `playTarget: string`
- `featured: boolean`
- `status: "ready" | "beta"`
- `version: string`
- `lastUpdated: string`
- `releaseNotes: string[]`

## Update Feed Contract

- `id: string`
- `gameSlug: string`
- `title: string`
- `summary: string`
- `timestamp: string`
- `type: "game" | "catalog"`

## Route Contract

- `#/` renders the home and catalog view
- `#/game/:slug` renders the play page for a specific cabinet

## Local Game Integration Contract

- `sourceType: "local"` entries must set `playTarget` to a key registered in `src/lib/localGames.tsx`
- The registered component is responsible for rendering the playable surface and any cabinet-specific HUD
- The current shipped manifest uses only local cabinets
