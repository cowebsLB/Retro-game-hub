import type { PropsWithChildren } from "react";

export function Shell({ children }: PropsWithChildren) {
  return (
    <div className="arcade-grid min-h-screen bg-transparent text-[var(--color-arcade-ink)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
