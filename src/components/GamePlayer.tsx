import { useState } from "react";
import type { GameEntry } from "../types/game";
import { LocalGameFrame } from "./LocalGameFrame";

type GamePlayerProps = {
  game: GameEntry;
};

export function GamePlayer({ game }: GamePlayerProps) {
  const [embedFailed, setEmbedFailed] = useState(false);

  if (game.sourceType === "local") {
    return <LocalGameFrame />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0718]">
        {!embedFailed ? (
          <iframe
            allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write"
            className="min-h-[600px] w-full border-0 bg-black"
            onError={() => setEmbedFailed(true)}
            src={game.playTarget}
            title={`${game.title} embedded game`}
          />
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <p className="pixel-title text-[0.7rem] text-pink-100">Embed unavailable</p>
            <p className="max-w-lg text-sm leading-7 text-slate-300">
              This cabinet blocked iframe playback in the browser. Open it in a new tab to keep playing.
            </p>
            <a
              className="rounded-full border border-pink-300/40 bg-pink-300/12 px-5 py-3 font-semibold text-pink-100 transition hover:bg-pink-300/20"
              href={game.playTarget}
              rel="noreferrer"
              target="_blank"
            >
              Open in a new tab
            </a>
          </div>
        )}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 text-sm text-slate-300">
          <p>External cabinets can be opened in a new tab if the source blocks embedding. Status and notes stay live through the runtime manifest feed.</p>
          <a
            className="mt-4 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/12 px-4 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
            href={game.playTarget}
            rel="noreferrer"
            target="_blank"
          >
            Open in a new tab
          </a>
        </div>
        <div className="rounded-[1.4rem] border border-white/10 bg-[#120d29]/95 px-4 py-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Latest release notes</p>
          <ul className="mt-3 space-y-3 pl-5 leading-7">
            {game.releaseNotes.map((note) => (
              <li className="list-disc" key={note}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
