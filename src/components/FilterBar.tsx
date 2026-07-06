type FilterBarProps = {
  query: string;
  selectedTag: string;
  tags: string[];
  onQueryChange: (value: string) => void;
  onTagChange: (value: string) => void;
};

export function FilterBar({
  query,
  selectedTag,
  tags,
  onQueryChange,
  onTagChange,
}: FilterBarProps) {
  return (
    <div className="glow-frame rounded-[1.5rem] border border-white/10 bg-white/6 p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Search the library
          <input
            className="rounded-2xl border border-white/10 bg-[#110d29] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by title, era, tag, or player mode"
            type="search"
            value={query}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Filter by tag
          <select
            className="rounded-2xl border border-white/10 bg-[#110d29] px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300"
            onChange={(event) => onTagChange(event.target.value)}
            value={selectedTag}
          >
            <option value="All">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
