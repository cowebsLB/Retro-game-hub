import { useCallback, useMemo, useState } from "react";

type Card = { id: string; glyph: string; color: string };

const GLYPHS: { symbol: string; color: string; glow: string }[] = [
  { symbol: "A", color: "#47f5ff", glow: "rgba(71,245,255,0.6)" },
  { symbol: "D", color: "#ff4fd8", glow: "rgba(255,79,216,0.6)" },
  { symbol: "O", color: "#ffd166", glow: "rgba(255,209,102,0.6)" },
  { symbol: "S", color: "#87f55b", glow: "rgba(135,245,91,0.6)" },
  { symbol: "X", color: "#b06eff", glow: "rgba(176,110,255,0.6)" },
  { symbol: "Y", color: "#ff8c42", glow: "rgba(255,140,66,0.6)" },
];

const STORAGE_KEY = "retro-game-hub-memory-vault-best-v2";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function createDeck(): Card[] {
  return shuffle(
    GLYPHS.flatMap((glyph, index) => [
      { id: `${glyph.symbol}-${index}-a`, glyph: glyph.symbol, color: glyph.color },
      { id: `${glyph.symbol}-${index}-b`, glyph: glyph.symbol, color: glyph.color },
    ]),
  );
}

function readBestMoves() {
  return Number(window.localStorage.getItem(STORAGE_KEY) ?? "0") || 0;
}

export function MemoryVaultGame() {
  const [deck, setDeck] = useState(() => createDeck());
  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [flipping, setFlipping] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("Open the vault - match each glyph pair.");
  const [busy, setBusy] = useState(false);
  const [bestMoves, setBestMoves] = useState(() => readBestMoves());

  const won = matched.length === deck.length;
  const matchPercent = (matched.length / deck.length) * 100;

  const glyphMeta = useMemo(() => {
    const map: Record<string, { color: string; glow: string }> = {};
    GLYPHS.forEach((glyph) => {
      map[glyph.symbol] = { color: glyph.color, glow: glyph.glow };
    });
    return map;
  }, []);

  const restart = () => {
    setDeck(createDeck());
    setRevealed([]);
    setMatched([]);
    setFlipping([]);
    setMoves(0);
    setStreak(0);
    setBusy(false);
    setMessage("Vault rearmed. Match cleanly to beat your best run.");
  };

  const statusTone = useMemo(() => {
    if (won) {
      return "text-emerald-300";
    }

    if (busy) {
      return "text-amber-200";
    }

    return "text-cyan-200";
  }, [busy, won]);

  const openCard = useCallback(
    (index: number) => {
      if (busy || won || revealed.includes(index) || matched.includes(index)) {
        return;
      }

      const nextRevealed = [...revealed, index];
      setRevealed(nextRevealed);
      setFlipping((current) => [...current, index]);
      window.setTimeout(() => setFlipping((current) => current.filter((value) => value !== index)), 180);

      if (nextRevealed.length < 2) {
        setMessage("Second signal needed - find the matching glyph.");
        return;
      }

      const [firstIndex, secondIndex] = nextRevealed;
      setMoves((current) => current + 1);

      if (deck[firstIndex].glyph === deck[secondIndex].glyph) {
        const nextMatched = [...matched, firstIndex, secondIndex];
        setMatched(nextMatched);
        setRevealed([]);
        setStreak((current) => current + 1);
        setMessage("Pair locked - keep the sequence alive.");

        if (nextMatched.length === deck.length) {
          const finalMoves = moves + 1;
          if (bestMoves === 0 || finalMoves < bestMoves) {
            window.localStorage.setItem(STORAGE_KEY, String(finalMoves));
            setBestMoves(finalMoves);
            setMessage("Vault open - new best run! Every glyph pair secured.");
          } else {
            setMessage("Vault open. Every glyph pair is secured.");
          }
        }

        return;
      }

      setBusy(true);
      setStreak(0);
      setMessage("Mismatch - the vault is scrambling those channels.");
      window.setTimeout(() => {
        setRevealed([]);
        setBusy(false);
      }, 750);
    },
    [bestMoves, busy, deck, matched, moves, revealed, won],
  );

  return (
    <div className="cabinet-shell space-y-4 p-4 sm:p-5">
      <div className="cabinet-marquee px-4 py-4 sm:px-5">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="pixel-title text-[0.6rem] text-emerald-100"
              style={{ textShadow: "0 0 8px rgba(135,245,91,0.8),0 0 20px rgba(135,245,91,0.4)" }}
            >
              Memory Vault 84
            </p>
            <p className="mt-2 text-sm text-slate-400">Cipher-grid puzzle - mirrored glyph pairs - chase a cleaner run</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="cabinet-chip">Moves {moves}</span>
            <span className="cabinet-chip">Matches {matched.length / 2} / 6</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="cabinet-chip">Moves: {moves}</span>
              <span className="cabinet-chip">Best: {bestMoves || "Unranked"}</span>
              <span className="cabinet-chip">Streak: {streak}</span>
            </div>
            <button className="btn-cyan py-2 text-sm" id="memory-vault-restart" onClick={restart} type="button">
              Reset Vault
            </button>
          </div>
          <div className="cabinet-playfield">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Signal Mesh</span>
              <span className={won ? "text-emerald-300" : busy ? "text-amber-300" : "text-slate-400"}>
                {won ? "Unlocked" : busy ? "Noise Spike" : "Stable"}
              </span>
            </div>
            <div aria-label="Memory Vault 84 puzzle grid" className="vault-grid grid grid-cols-3 gap-3 p-5 sm:grid-cols-4">
              {deck.map((card, index) => {
                const isMatched = matched.includes(index);
                const isOpen = isMatched || revealed.includes(index);
                const isFlippingCard = flipping.includes(index);
                const meta = glyphMeta[card.glyph];

                return (
                  <button
                    aria-label={isOpen ? `Glyph ${card.glyph}` : `Hidden vault card ${index + 1}`}
                    className={`vault-card relative aspect-square overflow-hidden rounded-[1.2rem] border text-4xl font-semibold transition-all duration-300 ${
                      isOpen
                        ? "border-emerald-500/60 bg-black/60 shadow-[0_0_15px_rgba(135,245,91,0.2)]"
                        : "border-white/10 bg-slate-900/60 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(71,245,255,0.25)]"
                    } ${isMatched ? "vault-card-matched" : ""} ${isFlippingCard ? "scale-95" : ""}`}
                    disabled={busy || isMatched}
                    key={card.id}
                    onClick={() => openCard(index)}
                    style={
                      isOpen && meta
                        ? {
                            boxShadow: isMatched
                              ? `inset 0 0 20px ${meta.glow},0 0 20px ${meta.glow}`
                              : `inset 0 0 12px ${meta.glow}`,
                          }
                        : {}
                    }
                    type="button"
                  >
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage:
                          "linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent 40%), repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(71,245,255,0.25) 8px,rgba(71,245,255,0.25) 9px),repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(71,245,255,0.25) 8px,rgba(71,245,255,0.25) 9px)",
                      }}
                    />

                    <div className="absolute left-2.5 top-2.5 h-2 w-2 border-l-2 border-t-2 border-cyan-400 opacity-50" />
                    <div className="absolute right-2.5 top-2.5 h-2 w-2 border-r-2 border-t-2 border-cyan-400 opacity-50" />
                    <div className="absolute bottom-2.5 left-2.5 h-2 w-2 border-b-2 border-l-2 border-cyan-400 opacity-50" />
                    <div className="absolute bottom-2.5 right-2.5 h-2 w-2 border-b-2 border-r-2 border-cyan-400 opacity-50" />

                    <div
                      className={`relative flex h-full w-full items-center justify-center transition-all duration-300 ${
                        isOpen ? "scale-100 opacity-100" : "scale-90 opacity-70"
                      }`}
                    >
                      {isOpen ? (
                        <span
                          className="block"
                          style={meta ? { color: meta.color, filter: `drop-shadow(0 0 10px ${meta.color})` } : {}}
                        >
                          {card.glyph}
                        </span>
                      ) : (
                        <span className="block font-mono text-3xl text-cyan-200/30">?</span>
                      )}
                    </div>
                    {isMatched && (
                      <div
                        className="absolute inset-0 animate-ping rounded-[1.2rem]"
                        style={{ border: `2px solid ${meta?.color}`, opacity: 0.35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="cabinet-note">
            <p className={`text-sm font-semibold ${statusTone}`}>{message}</p>
          </div>
        </div>
        <aside className="space-y-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
          <p className="section-eyebrow text-emerald-200/60">Vault Status</p>
          {[
            {
              label: "Vault Progress",
              value: `${Math.round(matchPercent)}%`,
              pct: matchPercent,
              from: "#87f55b",
              to: "#47f5ff",
              glow: "#87f55b",
            },
            {
              label: "Signal Streak",
              value: String(streak),
              pct: Math.min(100, streak * 25),
              from: "#47f5ff",
              to: "#b06eff",
              glow: "#47f5ff",
            },
          ].map(({ label, value, pct, from, to, glow }) => (
            <div className="cabinet-panel" key={label}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-xs">{value}</p>
              </div>
              <div className="cabinet-meter mt-3">
                <div
                  className="cabinet-meter-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg,${from},${to})`,
                    color: glow,
                    boxShadow: `0 0 12px ${glow}`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="cabinet-panel">
            <p className="section-eyebrow mb-3 text-emerald-200/60">Glyph Legend</p>
            <div className="grid grid-cols-3 gap-2">
              {GLYPHS.map((glyph) => (
                <div
                  className="flex items-center justify-center rounded-lg border border-white/8 bg-black/20 py-2 text-2xl"
                  key={glyph.symbol}
                  style={{ color: glyph.color, filter: `drop-shadow(0 0 6px ${glyph.color})` }}
                >
                  {glyph.symbol}
                </div>
              ))}
            </div>
          </div>
          <div className="cabinet-panel">
            <p className="section-eyebrow mb-3 text-emerald-200/60">Security Status</p>
            <div className="grid gap-2 text-xs">
              {[
                ["Board type", "12-card cipher grid"],
                ["Noise state", busy ? "Scrambling" : "Stable"],
                ["Best run", bestMoves ? `${bestMoves} moves` : "Unranked"],
              ].map(([key, value]) => (
                <div className="flex items-center justify-between gap-3" key={key}>
                  <span className="text-slate-400">{key}</span>
                  <span className="font-semibold text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cabinet-panel">
            <p className="mb-3 font-semibold text-white">Controls</p>
            <ul className="space-y-2 text-xs leading-6 text-slate-400">
              <li>Click or tap any tile to reveal</li>
              <li>Two tiles open per turn</li>
              <li>Match a pair to lock it permanently</li>
              <li>Clear all 6 pairs in fewest moves</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
