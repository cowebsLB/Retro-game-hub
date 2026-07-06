import { Link, useParams } from "react-router-dom";
import { GamePlayer } from "../components/GamePlayer";
import { getGameBySlug, getLatestUpdateForGame } from "../lib/catalog";
import { formatRelativeTime, resolveAssetPath } from "../lib/games";
import type { ArcadeFeedState } from "../types/game";

type GamePageProps = {
  feed: ArcadeFeedState;
};

export function GamePage({ feed }: GamePageProps) {
  const { slug } = useParams();
  const game = getGameBySlug(feed.games, slug);

  if (!game) {
    return (
      <main className="flex flex-1 items-center justify-center py-14">
        <div className="glow-frame max-w-xl rounded-[2rem] border border-white/10 bg-[#110d29]/96 p-8 text-center">
          <p className="pixel-title text-[0.68rem] text-pink-100">Cabinet not found</p>
          <p className="mt-4 text-slate-300">
            This route does not match any game in the current manifest.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/12 px-5 py-3 font-semibold text-cyan-100"
            to="/"
          >
            Return to the catalog
          </Link>
        </div>
      </main>
    );
  }

  const latestUpdate = getLatestUpdateForGame(feed.updates, game.slug);

  return (
    <main className="flex-1 py-6 sm:py-8">
      <div className="grid gap-8 xl:grid-cols-[0.68fr_1.32fr]">
        <aside className="space-y-5">
          <Link className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100" to="/">
            Back to catalog
          </Link>
          <div className="glow-frame overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#130f2f]/96">
            <img
              alt={`${game.title} cabinet art`}
              className="h-60 w-full object-cover"
              src={resolveAssetPath(game.thumbnail)}
            />
            <div className="space-y-5 p-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-pink-200/70">{game.era}</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-slate-200/75">
                    {game.version}
                  </span>
                </div>
                <h1 className="mt-3 text-4xl font-semibold text-white">{game.title}</h1>
              </div>
              <p className="text-base leading-8 text-slate-300">{game.description}</p>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200/75"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <dl className="grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2">
                  <dt className="font-semibold text-white">Players</dt>
                  <dd>{game.players}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2">
                  <dt className="font-semibold text-white">Source</dt>
                  <dd className="capitalize">{game.sourceType}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2">
                  <dt className="font-semibold text-white">Status</dt>
                  <dd className="capitalize">{game.status}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 pb-2">
                  <dt className="font-semibold text-white">Last update</dt>
                  <dd>{formatRelativeTime(game.lastUpdated)}</dd>
                </div>
              </dl>
              <div>
                <h2 className="text-lg font-semibold text-white">Controls</h2>
                <ul className="mt-3 space-y-3 pl-5 text-sm leading-7 text-slate-300">
                  {game.controls.map((control) => (
                    <li key={control} className="list-disc">
                      {control}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>
        <section className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-5 py-4 text-sm text-slate-300">
              Play page routes are hash-based for GitHub Pages compatibility, so direct links remain static-host safe.
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-[#120d29]/95 px-5 py-4 text-sm text-slate-300">
              <p className="font-semibold text-white">{latestUpdate?.title ?? "Cabinet feed synced"}</p>
              <p className="mt-2">{latestUpdate?.summary ?? "This cabinet is in sync with the runtime manifest feed."}</p>
            </div>
          </div>
          <GamePlayer game={game} />
        </section>
      </div>
    </main>
  );
}
