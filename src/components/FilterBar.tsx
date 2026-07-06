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
  const allTags = ["All", ...tags];

  return (
    <div className="space-y-4">
      <label className="block" htmlFor="catalog-search">
        <span className="sr-only">Search the library</span>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            className="filter-input pl-11 text-sm"
            id="catalog-search"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by title, era, tag, or player mode..."
            type="search"
            value={query}
          />
        </div>
      </label>

      <div aria-label="Filter by tag" className="flex flex-wrap gap-2" role="group">
        {allTags.map((tag) => (
          <button
            aria-pressed={selectedTag === tag}
            className={`filter-tag ${selectedTag === tag ? "filter-tag-active" : ""}`}
            key={tag}
            onClick={() => onTagChange(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
