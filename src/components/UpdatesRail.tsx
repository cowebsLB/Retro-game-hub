import { Link } from "react-router-dom";
import { formatRelativeTime } from "../lib/games";
import type { GameUpdate } from "../types/game";

type UpdatesRailProps = {
  updates: GameUpdate[];
};

export function UpdatesRail({ updates }: UpdatesRailProps) {
  return (
    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Live update rail</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Fresh cabinet notes</h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-slate-300">
          The hub now reads its catalog and recent changes from runtime JSON so cabinet metadata can refresh without touching the app shell.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {updates.slice(0, 3).map((update) => (
          <article
            className="rounded-[1.35rem] border border-white/10 bg-[#120d29]/95 p-4"
            key={update.id}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/10 px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-slate-200/75">
                {update.type}
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">
                {formatRelativeTime(update.timestamp)}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{update.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{update.summary}</p>
            <Link
              className="mt-4 inline-flex text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
              to={`/game/${update.gameSlug}`}
            >
              Open cabinet
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
