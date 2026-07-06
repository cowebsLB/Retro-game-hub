import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-14">
      <div className="glow-frame max-w-xl rounded-[2rem] border border-white/10 bg-[#110d29]/96 p-8 text-center">
        <p className="pixel-title text-[0.68rem] text-pink-100">404 continue?</p>
        <h1 className="mt-5 text-3xl font-semibold text-white">This route is off the board.</h1>
        <p className="mt-4 text-slate-300">
          Use the catalog to jump back to a playable cabinet.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/12 px-5 py-3 font-semibold text-cyan-100"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
