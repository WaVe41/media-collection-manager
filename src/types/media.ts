export type MediaType = 'image' | 'video' | 'document';

export type MediaItem = {
  id: string;
  name: string;
  type: MediaType;
  size: number;
  createdAt: string;
  url?: string;
};
