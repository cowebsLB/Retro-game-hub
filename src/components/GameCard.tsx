import { Link } from "react-router-dom";
import { formatRelativeTime, resolveAssetPath } from "../lib/games";
import type { GameEntry } from "../types/game";

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

type GameCardProps = {
  game: GameEntry;
};

export function GameCard({ game }: GameCardProps) {
  const tagColor = (tag: string) => tagColors[tag] ?? tagColors.Local;

  return (
    <article className="game-card" id={`game-card-${game.id}`}>
      <div className="game-card-img-wrap">
        <img alt={`${game.title} thumbnail`} src={resolveAssetPath(game.thumbnail)} />
        <div className="game-card-play-btn">
          <Link
            aria-label={`Play ${game.title}`}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-300/20 text-white backdrop-blur-sm transition hover:bg-cyan-300/30"
            to={`/game/${game.slug}`}
          >
            <svg aria-hidden="true" className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-slate-300 backdrop-blur-sm">
            {game.era}
          </span>
        </div>
        {game.featured && (
          <div className="absolute right-3 top-3 z-10">
            <span className="rounded-full border border-yellow-400/50 bg-yellow-400/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-yellow-200">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight text-white">{game.title}</h3>
          <div className="status-badge status-badge-ready shrink-0">{game.status}</div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-300/90">{game.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {game.tags.map((tag) => {
            const color = tagColor(tag);
            return (
              <span
                className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-wider"
                key={tag}
                style={{ border: `1px solid ${color.border}`, background: color.bg, color: color.text }}
              >
                {tag}
              </span>
            );
          })}
        </div>

        <div className="rounded-[0.85rem] border border-white/7 bg-black/15 px-4 py-2.5">
          <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{game.version}</span>
            <span>{formatRelativeTime(game.lastUpdated)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="text-xs font-medium text-slate-400">{game.players}</span>
          <Link className="btn-pink py-2 text-sm" id={`play-btn-${game.id}`} to={`/game/${game.slug}`}>
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </Link>
        </div>
      </div>
    </article>
  );
}
