import { MediaGallery } from './components/MediaGallery';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-slate-800">Media Collection</h1>
        <MediaGallery />
      </main>
    </div>
  );
}

export default App;
