export type MediaType = 'image' | 'video' | 'document';

export type UploadStatus = 'uploading' | 'done' | 'error';

export type MediaItem = {
  id: string;
  name: string;
  type: MediaType;
  size: number;
  createdAt: string;
};

export type UploadItem = {
  id: string;
  url?: string;
  thumbnail?: string;
  uploadStatus: UploadStatus;
};

export type MediaItemView = MediaItem & {
  url?: string;
  thumbnail?: string;
  uploadStatus?: UploadStatus;
};