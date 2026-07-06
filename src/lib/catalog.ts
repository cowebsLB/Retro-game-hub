import type { GameEntry, GameUpdate } from "../types/game";

export function getFeaturedGame(games: GameEntry[]): GameEntry | undefined {
  return games.find((game) => game.featured) ?? games[0];
}

export function getGameBySlug(games: GameEntry[], slug?: string): GameEntry | undefined {
  return games.find((game) => game.slug === slug);
}

export function getCatalogTags(games: GameEntry[]): string[] {
  return [...new Set(games.flatMap((game) => game.tags))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function filterGames(games: GameEntry[], query: string, tag: string): GameEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return games.filter((game) => {
    const matchesTag = tag === "All" || game.tags.includes(tag);
    const haystack = [
      game.title,
      game.description,
      game.era,
      game.players,
      game.version,
      ...game.tags,
      ...game.releaseNotes,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

    return matchesTag && matchesQuery;
  });
}

export function getLatestUpdateForGame(updates: GameUpdate[], slug: string): GameUpdate | undefined {
  return updates.find((update) => update.gameSlug === slug);
}
