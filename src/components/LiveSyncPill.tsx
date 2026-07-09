type LiveSyncPillProps = {
  syncing: boolean;
  source: "bundled" | "remote";
  lastSyncLabel: string;
  error: string | null;
};

export function LiveSyncPill({ syncing, source, lastSyncLabel, error }: LiveSyncPillProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-pink-300/30 bg-pink-300/08 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-pink-200">
        <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
        Feed fallback active
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/08 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-yellow-200">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
        Syncing feed...
      </div>
    );
  }

  return (
    <div className="live-pill">
      <span className="live-dot" />
      Feed {source} · {lastSyncLabel}
    </div>
  );
}
