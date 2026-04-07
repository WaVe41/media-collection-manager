import type { MediaFilter, SortOption } from '@store';

type Props = {
  filter: MediaFilter;
  sort: SortOption;
  search: string;
  onFilterChange: (f: MediaFilter) => void;
  onSortChange: (s: SortOption) => void;
  onSearchChange: (s: string) => void;
};

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
];

export function FilterBar({ filter, sort, search, onFilterChange, onSortChange, onSearchChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex gap-1">
        {FILTERS.map(filterItem => (
          <button
            key={filterItem.value}
            onClick={() => onFilterChange(filterItem.value)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === filterItem.value
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {filterItem.label}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={e => onSortChange(e.target.value as SortOption)}
        className="px-3 py-1 rounded border border-slate-200 text-sm text-slate-600 bg-white"
      >
        <option value="none">No sort</option>
        <option value="date">Newest first</option>
        <option value="size">Largest first</option>
      </select>

      <input
        type="text"
        placeholder="Search by name…"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="px-3 py-1 rounded border border-slate-200 text-sm flex-1 min-w-40"
      />
    </div>
  );
}
