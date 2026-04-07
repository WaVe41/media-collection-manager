# Media Collection Manager

A single-page React application for browsing, uploading, and managing media files.

## Running locally

```bash
npm install && npm run dev
```

The app runs at `http://localhost:5173`.

---

## Mock API

The mock lives entirely in `src/api/` and is intentionally kept simple - no MSW, no json-server, just plain async functions that match the contract exactly.

**Why no MSW?** Zero extra dependencies, no service worker setup. The mock is already clearly separated and typed - swapping it for a real API means replacing `src/api/mediaApi.ts` and nothing else.

**`fetchMediaPage(page)`** - slices 60 pre-generated items into pages of 12, waits 500–1000 ms, and throws 15% of the time.

**`uploadFile(file, onProgress, signal)`** - fires 20 incremental progress ticks at random intervals, checks the `AbortSignal` before each tick, and fails 20% of the time at the very end.

---

## Library choices

| Library | Why                                                                                                                                                      |
|---|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Redux Toolkit** | `createEntityAdapter` gives normalised storage and free selectors for entities. `createAsyncThunk` handles the loading/error/success lifeycle. Required. |
| **React Redux** | The standard binding layer. Required.                                                                                                                    |
| **Tailwind CSS 4** | Utility classes keep styles co-located with markup. No CSS files to maintain. The trade-off is verbose JSX and long classNames.                          |

---

## Trade-offs

**Flat-ish file structure.** Selectors, action creators, and reducers all live together inside slice files rather than being split into separate `selectors/`, `actions/` folders.

**Upload queue in local state, not Redux.** The per-file progress and status during an active upload (`useUpload`'s `queue`) lives in a `useState` hook not in Redux. It's simpler and avoids high-frequency Redux dispatches on every progress tick. The downside is that the upload state isn't globally accessible.

**Two Redux slices with cross-slice coordination via thunks.** `mediaSlice` owns the gallery items, `uploadSlice` owns the upload metadata (url, thumbnail, status). They're coordinated in `store/thunks.ts` using plain thunk functions rather than `extraReducers` subscriptions - more explicit, easier to follow.

**Thumbnail generation runs on the main thread. (drawImage)** True non-blocking would mean `OffscreenCanvas` + a Web Worker, which is a significantly more complex setup.

**IndexedDB over Cache API**.Cache API is built around HTTP request/response pairs. IndexedDB accepts any key/value natively, is better for `fileName: Blob` pairs, than create fake Url and Response. The trade-off is that IDB entries are never evicted.

**Inline SVGs.** Add icon library.

**Tailwind used for layout and structure, not polish.** Styles are functional but minimal — consistent spacing, readable typography, basic color palette. Also worth extracting into `@apply` classes rather than duplicating long `className` strings across components.

---

## What I'd improve given more time

**List virtualisation.** The grid currently renders every loaded card in the DOM. With hundreds of items this becomes a performance problem. `@tanstack/react-virtual` would keep only the visible rows mounted.

**Web Worker for thumbnails.** Moving canvas work off the main thread with `OffscreenCanvas` would make thumbnail generation completely non-blocking, which matters when processing multiple large video files simultaneously.

**Tests.** There's no test setup at all. Add Vitest + React Testing Library, test at least selectors (`selectFilteredMedia`), and the upload flow (cancellation, retry, optimistic updates).

**Accessibility.** Add ARIA labels at least at type filter buttons, sort select.

**IDB eviction.** Store a timestamp with each thumbnail and run a cleanup periodically.

**`clsx` for class composition.** Makes conditional class merging more readable

## Loom Demo

https://www.loom.com/share/cb61d0cda7d2494bb3135ab53eed6923


