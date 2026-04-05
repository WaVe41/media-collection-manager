import type { MediaType } from '../types/media.ts';

export const randBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

export const inferType = (name: string): MediaType => {
  if (name.endsWith('.mp4')) return 'video';
  if (name.endsWith('.pdf')) return 'document';
  return 'image';
};
