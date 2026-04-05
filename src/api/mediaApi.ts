import { MOCK_ITEMS } from './mockData';
import { randBetween } from './utils.ts';
import type { FetchMediaPageResult, UploadResult } from './types';

const PAGE_SIZE = 12;
const FETCH_FAILURE_RATE = 0.15;

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
    resolve({ url: 'blob:...' });
    // TODO: implement
  });
}
