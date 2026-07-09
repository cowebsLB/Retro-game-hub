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

const statusBadgeClassNames: Record<GameEntry["status"], string> = {
  ready: "status-badge status-badge-ready",
  beta: "status-badge border-yellow-300/40 bg-yellow-300/12 text-yellow-100",
};

export function Hero({ featuredGame, syncMeta }: HeroProps) {
  return (
    <section className="hero-shell px-6 py-10 sm:px-10 sm:py-14" aria-label="Featured game hero">
      <div className="scanline crt-vignette absolute inset-0" aria-hidden="true" />

      <div className="particles-overlay" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "#47f5ff" : i % 3 === 1 ? "#ff4fd8" : "#ffd166",
              opacity: 0.3 + Math.random() * 0.4,
              boxShadow: `0 0 ${4 + i}px currentColor`,
              animation: `float-card ${4 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-eyebrow text-cyan-300/80">GitHub Pages Arcade</span>
            <LiveSyncPill {...syncMeta} />
          </div>

          <h1 className="pixel-title max-w-3xl text-base text-white neon-text-cyan sm:text-xl lg:text-2xl">
            Pick an original retro cabinet, track fresh updates, and jump straight into the browser.
          </h1>

          <p className="max-w-2xl text-base leading-8 text-slate-300">
            Retro Game Hub pairs a static shell with a runtime-fed cabinet manifest -
            our in-repo titles, patch notes, and metadata keep moving while the site stays GitHub Pages friendly.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={`/game/${featuredGame.slug}`}
              className="btn-solid-cyan"
              id="hero-play-featured"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play featured game
            </Link>
            <a href="#catalog" className="btn-cyan">
              Browse library
            </a>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Live runtime manifest", color: "rgba(255,79,216,0.35)", bg: "rgba(255,79,216,0.08)" },
              { label: "Original-only lineup", color: "rgba(255,209,102,0.35)", bg: "rgba(255,209,102,0.08)" },
              { label: "Custom cabinets live", color: "rgba(135,245,91,0.35)", bg: "rgba(135,245,91,0.08)" },
            ].map(({ label, color, bg }) => (
              <span
                key={label}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-200/80"
                style={{ border: `1px solid ${color}`, background: bg }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="featured-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="section-eyebrow text-cyan-100/60">Featured Cabinet</span>
            <span className="cabinet-chip">{featuredGame.version}</span>
          </div>
          <div className="overflow-hidden rounded-[1.25rem]">
            <img
              alt={`${featuredGame.title} preview art`}
              className="h-48 w-full object-cover transition-transform duration-700 hover:scale-105"
              src={resolveAssetPath(featuredGame.thumbnail)}
            />
          </div>
          <div className="mt-5 space-y-3">
            <h2 className="pixel-title text-[0.68rem] text-white sm:text-[0.78rem]">
              {featuredGame.title}
            </h2>
            <p className="text-sm leading-7 text-slate-300">{featuredGame.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {featuredGame.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-cyan-100/60">
                Updated {new Date(featuredGame.lastUpdated).toLocaleDateString()}
              </p>
              <div className={statusBadgeClassNames[featuredGame.status]}>
                {featuredGame.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
