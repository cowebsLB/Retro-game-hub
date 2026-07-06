import { NavLink } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090512]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <NavLink className="pixel-title text-[0.62rem] text-cyan-200 sm:text-[0.72rem]" to="/">
          Retro Game Hub
        </NavLink>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-200 sm:gap-5">
          <a className="transition hover:text-cyan-200" href="#catalog">
            Catalog
          </a>
          <a className="transition hover:text-cyan-200" href="#how-to-play">
            How It Works
          </a>
          <a
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20"
            href="https://github.com/cowebsLB/Retro-game-hub"
            rel="noreferrer"
            target="_blank"
          >
            View Source
          </a>
        </nav>
      </div>
    </header>
  );
}
