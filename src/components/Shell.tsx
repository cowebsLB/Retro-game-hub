import type { PropsWithChildren } from "react";

export function Shell({ children }: PropsWithChildren) {
  return (
    <div className="arcade-grid relative min-h-screen bg-transparent text-[var(--color-arcade-ink)]">
      {/* Subtle corner glow accents */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 40% 35% at 0% 0%, rgba(71,245,255,0.04), transparent),
            radial-gradient(ellipse 40% 35% at 100% 100%, rgba(255,79,216,0.04), transparent)
          `,
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
