type MobileControlButtonProps = {
  label: string;
  onPress?: () => void;
  onPressEnd?: () => void;
  tone?: "cyan" | "pink" | "gold";
};

function getToneClasses(tone: MobileControlButtonProps["tone"] = "cyan") {
  if (tone === "pink") {
    return "border-pink-300/50 bg-pink-300/12 text-pink-100 active:bg-pink-300/20";
  }

  if (tone === "gold") {
    return "border-yellow-300/50 bg-yellow-300/12 text-yellow-100 active:bg-yellow-300/20";
  }

  return "border-cyan-300/50 bg-cyan-300/12 text-cyan-100 active:bg-cyan-300/20";
}

function MobileControlButton({
  label,
  onPress,
  onPressEnd,
  tone,
}: MobileControlButtonProps) {
  const release = () => onPressEnd?.();

  return (
    <button
      aria-label={label}
      className={`touch-manipulation rounded-2xl border px-4 py-4 text-sm font-semibold shadow-[0_0_18px_rgba(0,0,0,0.18)] transition ${getToneClasses(tone)}`}
      onClick={onPressEnd ? undefined : onPress}
      onPointerCancel={release}
      onPointerDown={onPress}
      onPointerLeave={release}
      onPointerUp={release}
      type="button"
    >
      {label}
    </button>
  );
}

type MobileControlDockProps = {
  title: string;
  instruction: string;
  children: ReactNode;
};

export function MobileControlDock({ title, instruction, children }: MobileControlDockProps) {
  return (
    <section
      aria-label={title}
      className="rounded-[1.35rem] border border-white/10 bg-white/4 p-3 sm:hidden"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          {title}
        </p>
        <p className="text-right text-[0.68rem] text-slate-500">{instruction}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

type ActionClusterProps = {
  actions: Array<{
    label: string;
    onPress?: () => void;
    onPressEnd?: () => void;
    tone?: "cyan" | "pink" | "gold";
  }>;
};

export function MobileActionCluster({ actions }: ActionClusterProps) {
  return (
    <div className={`grid gap-2 ${actions.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {actions.map((action) => (
        <MobileControlButton
          key={action.label}
          label={action.label}
          onPress={action.onPress}
          onPressEnd={action.onPressEnd}
          tone={action.tone}
        />
      ))}
    </div>
  );
}
import type { ReactNode } from "react";
