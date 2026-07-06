export type GameSourceType = "local" | "embed";
export type GameStatus = "ready" | "beta";

export type GameEntry = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  tags: string[];
  era: string;
  players: string;
  controls: string[];
  sourceType: GameSourceType;
  playTarget: string;
  featured: boolean;
  status: GameStatus;
  version: string;
  lastUpdated: string;
  releaseNotes: string[];
};

export type GameUpdate = {
  id: string;
  gameSlug: string;
  title: string;
  summary: string;
  timestamp: string;
  type: "game" | "catalog";
};

export type ArcadeFeedState = {
  games: GameEntry[];
  updates: GameUpdate[];
  syncing: boolean;
  source: "bundled" | "remote";
  lastSyncAt: number | null;
  error: string | null;
};
