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
