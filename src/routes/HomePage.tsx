import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { GameCard } from "../components/GameCard";
import { Hero } from "../components/Hero";
import { UpdatesRail } from "../components/UpdatesRail";
import { filterGames, getCatalogTags, getFeaturedGame } from "../lib/catalog";
import type { ArcadeFeedState } from "../types/game";

type HomePageProps = {
  feed: ArcadeFeedState;
};

export function HomePage({ feed }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const deferredQuery = useDeferredValue(query);
  const featuredGame = getFeaturedGame(feed.games);
  const tags = getCatalogTags(feed.games);
  const filteredGames = filterGames(feed.games, deferredQuery, selectedTag);
  const lastSyncLabel = useMemo(() => {
    if (!feed.lastSyncAt) {
      return "bundled";
    }

    return `${Math.max(1, Math.floor((Date.now() - feed.lastSyncAt) / 60000))}m ago`;
  }, [feed.lastSyncAt]);

  if (!featuredGame) {
    return null;
  }

  return (
    <main className="flex-1 py-6 sm:py-8">
      <div className="space-y-8">
        <Hero
          featuredGame={featuredGame}
          syncMeta={{
            syncing: feed.syncing,
            source: feed.source,
            lastSyncLabel,
            error: feed.error,
          }}
        />

        <section
          className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-5 text-sm text-slate-200 sm:grid-cols-3 sm:p-6"
          id="how-to-play"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">01 Pick</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Browse cabinets by tag, era, update notes, or player mode.</h2>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">02 Launch</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Open a dedicated play page with metadata, release notes, and controls.</h2>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">03 Play</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Run the upgraded local cabinet or launch an embedded external classic.</h2>
          </div>
        </section>

        <UpdatesRail updates={feed.updates} />

        <section className="space-y-5" id="catalog">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-pink-200/70">Library</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Playable retro picks</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-300">
              The library now filters across cabinet release notes and refreshes its runtime feed automatically while staying fully static-host compatible.
            </p>
          </div>
          <FilterBar
            onQueryChange={(value) => startTransition(() => setQuery(value))}
            onTagChange={(value) => startTransition(() => setSelectedTag(value))}
            query={query}
            selectedTag={selectedTag}
            tags={tags}
          />
          {filteredGames.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredGames.map((game) => (
                <GameCard game={game} key={game.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-white/15 bg-white/4 px-6 py-12 text-center text-slate-300">
              <p className="pixel-title text-[0.64rem] text-white">No matching cabinet</p>
              <p className="mt-4 text-base">Try another tag, version, or search term to pull a game back into the grid.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
