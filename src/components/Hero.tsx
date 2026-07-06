import { Link } from "react-router-dom";
import { resolveAssetPath } from "../lib/games";
import type { GameEntry } from "../types/game";
import { LiveSyncPill } from "./LiveSyncPill";

type HeroProps = {
  featuredGame: GameEntry;
  syncMeta: {
    syncing: boolean;
    source: "bundled" | "remote";
    lastSyncLabel: string;
    error: string | null;
  };
};

export function Hero({ featuredGame, syncMeta }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(24,18,61,0.95),rgba(14,10,34,0.98))] px-6 py-8 sm:px-10 sm:py-12">
      <div className="scanline absolute inset-0" aria-hidden="true" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-200/80">
              GitHub Pages arcade
            </p>
            <LiveSyncPill {...syncMeta} />
          </div>
          <h1 className="pixel-title max-w-3xl text-lg text-white sm:text-2xl lg:text-[2rem]">
            Pick a retro cabinet, track fresh updates, and jump straight into the browser.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/88">
            Retro Game Hub now pairs a static shell with a runtime-fed cabinet manifest, so featured titles, patch notes, and metadata can keep moving while the site stays GitHub Pages friendly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className="rounded-full border border-cyan-300 bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-200"
              to={`/game/${featuredGame.slug}`}
            >
              Play featured game
            </Link>
            <a
              className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-pink-300 hover:text-pink-100"
              href="#catalog"
            >
              Browse library
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200/75">
            <span className="rounded-full border border-pink-300/30 bg-pink-300/10 px-3 py-1">
              Live runtime manifest
            </span>
            <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1">
              Local + embedded play
            </span>
            <span className="rounded-full border border-green-300/30 bg-green-300/10 px-3 py-1">
              Showcase cabinet upgraded
            </span>
          </div>
        </div>
        <div className="float-card marquee-glow glow-frame relative overflow-hidden rounded-[1.75rem] border border-cyan-200/20 bg-[#120d2d] p-5">
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-cyan-100/70">
            <span>Featured cabinet</span>
            <span>{featuredGame.version}</span>
          </div>
          <img
            alt={`${featuredGame.title} preview art`}
            className="h-56 w-full rounded-[1.25rem] object-cover"
            src={resolveAssetPath(featuredGame.thumbnail)}
          />
          <div className="mt-5">
            <h2 className="pixel-title text-[0.7rem] text-white sm:text-[0.8rem]">{featuredGame.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{featuredGame.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredGame.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200/75"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-cyan-100/80">
              Updated {new Date(featuredGame.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
