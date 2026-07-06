import { Link } from "react-router-dom";
import { formatRelativeTime, resolveAssetPath } from "../lib/games";
import type { GameEntry } from "../types/game";

type GameCardProps = {
  game: GameEntry;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <article className="group glow-frame overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#130f2f]/95 transition duration-300 hover:-translate-y-1">
      <img
        alt={`${game.title} thumbnail`}
        className="h-48 w-full object-cover"
        src={resolveAssetPath(game.thumbnail)}
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{game.era}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{game.title}</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
            {game.sourceType}
          </span>
        </div>
        <p className="text-sm leading-7 text-slate-300">{game.description}</p>
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
        <div className="rounded-[1rem] border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-4">
            <span>{game.version}</span>
            <span>{formatRelativeTime(game.lastUpdated)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-sm text-slate-300">{game.players}</p>
          <Link
            className="rounded-full border border-pink-300/40 bg-pink-300/12 px-4 py-2 text-sm font-semibold text-pink-100 transition hover:border-pink-200 hover:bg-pink-300/20"
            to={`/game/${game.slug}`}
          >
            Play {game.title}
          </Link>
        </div>
      </div>
    </article>
  );
}
