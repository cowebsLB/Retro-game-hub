type LiveSyncPillProps = {
  syncing: boolean;
  source: "bundled" | "remote";
  lastSyncLabel: string;
  error: string | null;
};

export function LiveSyncPill({ syncing, source, lastSyncLabel, error }: LiveSyncPillProps) {
  const tone = error
    ? "border-pink-300/35 bg-pink-300/12 text-pink-100"
    : source === "remote"
      ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
      : "border-yellow-300/35 bg-yellow-300/12 text-yellow-100";

  return (
    <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>
      {error ? "Feed fallback active" : syncing ? "Syncing arcade feed" : `Feed ${source} • ${lastSyncLabel}`}
    </div>
  );
}
