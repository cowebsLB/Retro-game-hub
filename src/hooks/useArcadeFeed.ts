import { useEffect, useEffectEvent, useState } from "react";
import rawUpdates from "../data/updates.json";
import { catalogGames, parseGameCatalog, parseGameUpdates, resolveDataPath } from "../lib/games";
import type { ArcadeFeedState } from "../types/game";

const bundledUpdates = parseGameUpdates(rawUpdates);

const initialState: ArcadeFeedState = {
  games: catalogGames,
  updates: bundledUpdates,
  syncing: false,
  source: "bundled",
  lastSyncAt: null,
  error: null,
};

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${resolveDataPath(path)}?t=${Date.now()}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function useArcadeFeed() {
  const [state, setState] = useState<ArcadeFeedState>(initialState);

  const syncFeed = useEffectEvent(async (signal: AbortSignal) => {
    setState((current) => ({
      ...current,
      syncing: true,
      error: null,
    }));

    try {
      const [gamePayload, updatePayload] = await Promise.all([
        fetchJson<unknown>("data/games.json", signal),
        fetchJson<unknown>("data/updates.json", signal),
      ]);

      const games = parseGameCatalog(gamePayload);
      const updates = parseGameUpdates(updatePayload);

      setState({
        games,
        updates,
        syncing: false,
        source: "remote",
        lastSyncAt: Date.now(),
        error: null,
      });
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      setState((current) => ({
        ...current,
        syncing: false,
        error: error instanceof Error ? error.message : "Live arcade feed unavailable.",
      }));
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    void syncFeed(controller.signal);

    const intervalId = window.setInterval(() => {
      const nextController = new AbortController();
      void syncFeed(nextController.signal);
    }, 60000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  return state;
}
