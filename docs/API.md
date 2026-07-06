# API Contract

## Scope

Retro Game Hub does not expose a backend API. Its public integration surface is the in-repo content contract used by the catalog and runtime feeds.

## `GameEntry`

```ts
type GameEntry = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  tags: string[];
  era: string;
  players: string;
  controls: string[];
  sourceType: "local" | "embed";
  playTarget: string;
  featured: boolean;
  status: "ready" | "beta";
  version: string;
  lastUpdated: string;
  releaseNotes: string[];
};
```

### Validation Rules

- all string fields must be present and non-empty
- `tags` must be a non-empty string array
- `controls` must be a non-empty string array
- `releaseNotes` must be a non-empty string array
- `featured` must be a boolean
- `sourceType` must be `local` or `embed`
- `status` must be `ready` or `beta`
- `lastUpdated` must be a valid ISO date string
- `slug` values must be unique across the manifest

## `GameUpdate`

```ts
type GameUpdate = {
  id: string;
  gameSlug: string;
  title: string;
  summary: string;
  timestamp: string;
  type: "game" | "catalog" | "release" | "patch" | "hotfix" | "feature";
};
```

### Validation Rules

- all string fields must be present and non-empty
- `timestamp` must be a valid ISO date string
- `type` must match one of the supported update labels

## Route Contract

- `#/`
- `#/game/:slug`

## Local Cabinet Contract

- local entries must use `sourceType: "local"`
- `playTarget` must resolve through `src/lib/localGames.tsx`
- the registered component is responsible for rendering its own playable surface and cabinet-specific HUD

## Runtime Feed Contract

The runtime mirror files under `public/data` must remain schema-compatible with the bundled files under `src/data`.
