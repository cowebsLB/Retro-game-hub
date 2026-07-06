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
    if (!feed.lastSyncAt) return "bundled";
    return `${Math.max(1, Math.floor((Date.now() - feed.lastSyncAt) / 60000))}m ago`;
  }, [feed.lastSyncAt]);

  if (!featuredGame) return null;

  return (
    <main className="flex-1 py-6 sm:py-8 page-enter" id="main-content">
      <div className="space-y-10">
        <Hero
          featuredGame={featuredGame}
          syncMeta={{ syncing: feed.syncing, source: feed.source, lastSyncLabel, error: feed.error }}
        />

        <section
          className="grid gap-4 sm:grid-cols-3"
          id="how-to-play"
          aria-label="How to play"
        >
          {[
            {
              step: "01",
              accent: "text-cyan-300/80",
              title: "Browse cabinets",
              body: "Filter by tag, era, release notes, or player mode to find your match.",
              icon: "Arc",
            },
            {
              step: "02",
              accent: "text-pink-300/80",
              title: "Open the play page",
              body: "Each cabinet has metadata, patch notes, controls, and a launch area.",
              icon: "Go",
            },
            {
              step: "03",
              accent: "text-yellow-300/80",
              title: "Play the original",
              body: "All games are custom-built in-repo - no embeds, no external links needed.",
              icon: "CRT",
            },
          ].map(({ step, accent, title, body, icon }) => (
            <div key={step} className="how-step">
              <div className="mb-3 flex items-center gap-3">
                <span className="pixel-title text-[0.6rem] text-cyan-100">{icon}</span>
                <p className={`section-eyebrow ${accent}`}>{step}</p>
              </div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
            </div>
          ))}
        </section>

        <UpdatesRail updates={feed.updates} />

        <section className="space-y-6" id="catalog" aria-label="Game catalog">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow text-pink-200/70">Library</p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Playable retro picks
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              Every cabinet in this library is hand-built and lives right in the repository - no third-party embeds, fully static-host compatible.
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
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredGames.map((game) => (
                <GameCard game={game} key={game.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-white/3 px-6 py-14 text-center">
              <p className="pixel-title text-[0.62rem] text-white">No matching cabinet</p>
              <p className="mt-5 text-sm text-slate-400">
                Try another tag, era, or search term to pull a game back into the grid.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
