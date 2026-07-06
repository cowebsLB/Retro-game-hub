import { Link, useParams } from "react-router-dom";
import { GamePlayer } from "../components/GamePlayer";
import { getGameBySlug, getLatestUpdateForGame } from "../lib/catalog";
import { formatRelativeTime, resolveAssetPath } from "../lib/games";
import type { ArcadeFeedState } from "../types/game";

type GamePageProps = {
  feed: ArcadeFeedState;
};

const tagColors: Record<string, { border: string; bg: string; text: string }> = {
  Arcade: { border: "rgba(71,245,255,0.3)", bg: "rgba(71,245,255,0.08)", text: "#a8f8ff" },
  Racing: { border: "rgba(255,79,216,0.3)", bg: "rgba(255,79,216,0.08)", text: "#ffd0f4" },
  Puzzle: { border: "rgba(135,245,91,0.3)", bg: "rgba(135,245,91,0.08)", text: "#c4fab0" },
  Shooter: { border: "rgba(255,209,102,0.3)", bg: "rgba(255,209,102,0.08)", text: "#ffe8a0" },
  Dodge: { border: "rgba(176,110,255,0.3)", bg: "rgba(176,110,255,0.08)", text: "#ddc8ff" },
  Reflex: { border: "rgba(255,140,66,0.3)", bg: "rgba(255,140,66,0.08)", text: "#ffc99e" },
  Memory: { border: "rgba(71,245,255,0.3)", bg: "rgba(71,245,255,0.08)", text: "#a8f8ff" },
  Local: { border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.05)", text: "#c8c4d8" },
};

function TagChip({ tag }: { tag: string }) {
  const c = tagColors[tag] ?? tagColors.Local;
  return (
    <span
      className="rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-wider"
      style={{ border: `1px solid ${c.border}`, background: c.bg, color: c.text }}
    >
      {tag}
    </span>
  );
}

export function GamePage({ feed }: GamePageProps) {
  const { slug } = useParams();
  const game = getGameBySlug(feed.games, slug);

  if (!game) {
    return (
      <main className="flex flex-1 items-center justify-center py-14">
        <div className="glow-frame max-w-xl rounded-[2rem] border border-white/10 bg-[#110d29]/96 p-10 text-center">
          <div className="mb-4 text-4xl text-cyan-200">404</div>
          <p className="pixel-title text-[0.68rem] text-pink-100">Cabinet not found</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            This route does not match any game in the current manifest.
          </p>
          <Link className="btn-cyan mt-6 inline-flex" to="/">
            Return to catalog
          </Link>
        </div>
      </main>
    );
  }

  const latestUpdate = getLatestUpdateForGame(feed.updates, game.slug);

  return (
    <main className="flex-1 py-6 sm:py-8 page-enter">
      <div className="grid gap-8 xl:grid-cols-[0.65fr_1.35fr]">
        <aside className="space-y-5">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
            to="/"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to catalog
          </Link>

          <div className="glow-frame overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#130f2f]/98">
            <div className="relative h-56 overflow-hidden">
              <img
                alt={`${game.title} cabinet art`}
                className="h-full w-full object-cover"
                src={resolveAssetPath(game.thumbnail)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130f2f] via-[#130f2f]/30 to-transparent" />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-slate-300 backdrop-blur-sm">
                  {game.era}
                </span>
              </div>
              <div className="absolute right-3 top-3">
                <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[0.62rem] font-semibold text-slate-300 backdrop-blur-sm">
                  {game.version}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <h1 className="text-3xl leading-tight font-bold text-white">{game.title}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-300">{game.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} />
                ))}
              </div>

              <dl className="grid gap-2 rounded-[1rem] border border-white/7 bg-black/15 p-4 text-sm">
                {[
                  { label: "Players", value: game.players },
                  { label: "Source", value: game.sourceType, capitalize: true },
                  { label: "Status", value: game.status, capitalize: true },
                  { label: "Last update", value: formatRelativeTime(game.lastUpdated) },
                ].map(({ label, value, capitalize }) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-white/6 pb-2 last:border-0 last:pb-0">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
                    <dd className={`font-medium text-slate-200 ${capitalize ? "capitalize" : ""}`}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Controls</h2>
                <ul className="space-y-2 text-sm leading-7 text-slate-400">
                  {game.controls.map((control) => (
                    <li key={control} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/60" />
                      {control}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Release Notes</h2>
                <ul className="space-y-2 text-sm leading-7 text-slate-400">
                  {game.releaseNotes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400/60" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 px-5 py-4 text-sm text-slate-400">
              <p className="mb-1 font-semibold text-slate-200">Hash-based routing</p>
              Play pages use hash routes for GitHub Pages compatibility - direct cabinet links remain static-host safe.
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-[#120d29]/98 px-5 py-4 text-sm text-slate-400">
              <p className="mb-1 font-semibold text-white">{latestUpdate?.title ?? "Cabinet feed synced"}</p>
              {latestUpdate?.summary ?? "This cabinet is in sync with the runtime manifest feed."}
            </div>
          </div>

          <GamePlayer game={game} />
        </section>
      </div>
    </main>
  );
}
