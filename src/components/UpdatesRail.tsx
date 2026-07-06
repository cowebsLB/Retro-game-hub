import { Link } from "react-router-dom";
import { formatRelativeTime } from "../lib/games";
import type { GameUpdate } from "../types/game";

type UpdatesRailProps = {
  updates: GameUpdate[];
};

const typeColors: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  release: { border: 'rgba(71,245,255,0.3)', bg: 'rgba(71,245,255,0.07)', text: '#a8f8ff', dot: '#47f5ff' },
  patch: { border: 'rgba(135,245,91,0.3)', bg: 'rgba(135,245,91,0.07)', text: '#c4fab0', dot: '#87f55b' },
  hotfix: { border: 'rgba(255,79,216,0.3)', bg: 'rgba(255,79,216,0.07)', text: '#ffd0f4', dot: '#ff4fd8' },
  feature: { border: 'rgba(255,209,102,0.3)', bg: 'rgba(255,209,102,0.07)', text: '#ffe8a0', dot: '#ffd166' },
};

export function UpdatesRail({ updates }: UpdatesRailProps) {
  return (
    <section
      className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5 sm:p-6"
      aria-label="Recent cabinet updates"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="section-eyebrow text-cyan-200/70">Live Update Rail</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Fresh cabinet notes</h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-slate-400">
          Cabinet metadata refreshes from runtime JSON without touching the app shell.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {updates.slice(0, 3).map((update) => {
          const c = typeColors[update.type] ?? typeColors['release'];
          return (
            <article
              className="group rounded-[1.3rem] border border-white/8 bg-[#0f0b26]/96 p-4 transition-all duration-300 hover:border-white/15 hover:bg-[#150f30]/96"
              key={update.id}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-wider"
                  style={{ border: `1px solid ${c.border}`, background: c.bg, color: c.text }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}` }}
                  />
                  {update.type}
                </span>
                <span className="text-xs text-slate-500">{formatRelativeTime(update.timestamp)}</span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">{update.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-3">{update.summary}</p>
              <Link
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition hover:text-cyan-100"
                to={`/game/${update.gameSlug}`}
              >
                Open cabinet
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
