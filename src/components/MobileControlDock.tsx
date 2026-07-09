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

type DirectionPadProps = {
  onUpPress?: () => void;
  onUpRelease?: () => void;
  onDownPress?: () => void;
  onDownRelease?: () => void;
  onLeftPress?: () => void;
  onLeftRelease?: () => void;
  onRightPress?: () => void;
  onRightRelease?: () => void;
};

export function MobileDirectionPad({
  onUpPress,
  onUpRelease,
  onDownPress,
  onDownRelease,
  onLeftPress,
  onLeftRelease,
  onRightPress,
  onRightRelease,
}: DirectionPadProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div />
      <MobileControlButton label="Move up" onPress={onUpPress} onPressEnd={onUpRelease} />
      <div />
      <MobileControlButton label="Move left" onPress={onLeftPress} onPressEnd={onLeftRelease} />
      <div />
      <MobileControlButton label="Move right" onPress={onRightPress} onPressEnd={onRightRelease} />
      <div />
      <MobileControlButton label="Move down" onPress={onDownPress} onPressEnd={onDownRelease} />
      <div />
    </div>
  );
}

type MobileControlDockProps = {
  title: string;
  children: ReactNode;
};

export function MobileControlDock({ title, children }: MobileControlDockProps) {
  return (
    <section
      aria-label={title}
      className="rounded-[1.35rem] border border-white/10 bg-white/4 p-3 sm:hidden"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          {title}
        </p>
        <p className="text-[0.68rem] text-slate-500">Touch and hold</p>
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
    <div className="grid grid-cols-2 gap-2">
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
