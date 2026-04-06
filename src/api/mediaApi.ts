import { MOCK_ITEMS } from './mockData';
import { randBetween } from './utils.ts';
import type { FetchMediaPageResult, UploadResult } from './types';

const PAGE_SIZE = 12;
const FETCH_FAILURE_RATE = 0.15;
const UPLOAD_FAILURE_RATE = 0.2;

const TOTAL_PROGRESS_STEPS = 20;

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export async function fetchMediaPage(page: number): Promise<FetchMediaPageResult> {
  await delay(randBetween(500, 1000));

  if (Math.random() < FETCH_FAILURE_RATE) {
    throw new Error('Failed to fetch media page. Please try again.');
  }

  const total = MOCK_ITEMS.length;
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const items = MOCK_ITEMS.slice(start, end);
  const nextPage = end < total ? page + 1 : null;

  return { items, nextPage, total };
}

export async function uploadFile(
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    let step = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const onAbort = () => {
      clearTimeout(timerId);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal.addEventListener('abort', onAbort, { once: true });

    const tick = () => {
      step++;
      const percent = Math.round((step / TOTAL_PROGRESS_STEPS) * 100);
      onProgress(percent);

      if (step < TOTAL_PROGRESS_STEPS) {
        timerId = setTimeout(tick, randBetween(100, 200));
        return;
      }

      signal.removeEventListener('abort', onAbort);

      if (Math.random() < UPLOAD_FAILURE_RATE) {
        reject(new Error('Upload failed due to a server error.'));
        return;
      }

      const url = URL.createObjectURL(file);
      resolve({ url });
    };

    timerId = setTimeout(tick, randBetween(100, 200));
  });
}
