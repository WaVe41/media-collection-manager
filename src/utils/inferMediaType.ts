import type { MediaType } from '../types/media.ts';

export const inferMediaType = (mimeType: string): MediaType => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}
