export type { MediaItem, MediaType } from '../types/media'

import type { MediaItem } from '../types/media';

export type FetchMediaPageResult = {
  items: MediaItem[]
  nextPage: number | null
  total: number
}

export type UploadResult = {
  url: string
}