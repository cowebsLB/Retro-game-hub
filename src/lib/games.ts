import rawGames from "../data/games.json";
import type { GameEntry, GameUpdate } from "../types/game";

const validSources = new Set(["local", "embed"]);
const validStatuses = new Set(["ready", "beta"]);
const validUpdateTypes = new Set(["game", "catalog"]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseIsoDate(value: unknown, field: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`Field "${field}" must be a valid ISO date string.`);
  }

  return value;
}

function parseGameEntry(value: unknown): GameEntry {
  if (!value || typeof value !== "object") {
    throw new Error("Game entry must be an object.");
  }

  const entry = value as Record<string, unknown>;
  const stringFields = [
    "id",
    "title",
    "slug",
    "description",
    "thumbnail",
    "era",
    "players",
    "playTarget",
    "version",
  ] as const;

  for (const field of stringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim().length === 0) {
      throw new Error(`Game entry field "${field}" must be a non-empty string.`);
    }
  }

  if (!isStringArray(entry.tags) || entry.tags.length === 0) {
    throw new Error(`Game "${String(entry.title)}" must include at least one tag.`);
  }

  if (!isStringArray(entry.controls) || entry.controls.length === 0) {
    throw new Error(`Game "${String(entry.title)}" must include at least one control.`);
  }

  if (!isStringArray(entry.releaseNotes) || entry.releaseNotes.length === 0) {
    throw new Error(`Game "${String(entry.title)}" must include release notes.`);
  }

  if (typeof entry.featured !== "boolean") {
    throw new Error(`Game "${String(entry.title)}" must define featured as boolean.`);
  }

  if (!validSources.has(String(entry.sourceType))) {
    throw new Error(`Game "${String(entry.title)}" has an invalid sourceType.`);
  }

  if (!validStatuses.has(String(entry.status))) {
    throw new Error(`Game "${String(entry.title)}" has an invalid status.`);
  }

  parseIsoDate(entry.lastUpdated, "lastUpdated");

  return entry as GameEntry;
}

export function parseGameCatalog(value: unknown): GameEntry[] {
  if (!Array.isArray(value)) {
    throw new Error("Game catalog must be an array.");
  }

  const parsedGames = value.map(parseGameEntry);
  const slugs = new Set<string>();

  for (const game of parsedGames) {
    if (slugs.has(game.slug)) {
      throw new Error(`Duplicate game slug found: ${game.slug}`);
    }

    slugs.add(game.slug);
  }

  return parsedGames;
}

function parseGameUpdate(value: unknown): GameUpdate {
  if (!value || typeof value !== "object") {
    throw new Error("Game update must be an object.");
  }

  const entry = value as Record<string, unknown>;
  const stringFields = ["id", "gameSlug", "title", "summary"] as const;

  for (const field of stringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim().length === 0) {
      throw new Error(`Game update field "${field}" must be a non-empty string.`);
    }
  }

  if (!validUpdateTypes.has(String(entry.type))) {
    throw new Error(`Game update "${String(entry.title)}" has an invalid type.`);
  }

  parseIsoDate(entry.timestamp, "timestamp");

  return entry as GameUpdate;
}

export function parseGameUpdates(value: unknown): GameUpdate[] {
  if (!Array.isArray(value)) {
    throw new Error("Game updates must be an array.");
  }

  return value.map(parseGameUpdate).sort((left, right) =>
    new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

export const catalogGames = parseGameCatalog(rawGames);

export function resolveAssetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export function resolveDataPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export function formatRelativeTime(timestamp: string, now = Date.now()): string {
  const diffMs = now - new Date(timestamp).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
