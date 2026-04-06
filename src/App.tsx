import { useState } from 'react';
import type { MediaFilter, SortOption } from '@store';
import { MediaGallery } from './components/MediaGallery';
import { UploadZone } from './components/UploadZone';
import { FilterBar } from './components/FilterBar';

function App() {
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [sort, setSort] = useState<SortOption>('none');
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-slate-800">Media Collection</h1>
        <UploadZone />
        <FilterBar
          filter={filter}
          sort={sort}
          search={search}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onSearchChange={setSearch}
        />
        <MediaGallery filter={filter} sort={sort} search={search} />
      </main>
    </div>
  );
}

export default App;
