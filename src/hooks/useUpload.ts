import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setUploadDone, setUploadError, setUploadRetry, setThumbnail, selectUploadEntities } from '@store/uploadSlice';
import { startUploadItem, removeMediaItem } from '@store/thunks';
import { uploadFile } from '@api/mediaApi';
import { generateThumbnail } from '@utils/generateThumbnail';
import { getCachedThumbnail, cacheThumbnail, generateDbKey } from '@utils/thumbnailCache';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type ActiveUpload = {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'error';
  error: string | null;
};

export type ValidationError = {
  fileName: string;
  error: string;
};

export function useUpload() {
  const dispatch = useAppDispatch();
  const uploadEntities = useAppSelector(selectUploadEntities);
  const [queue, setQueue] = useState<Record<string, ActiveUpload>>({});

  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const filesRef = useRef<Map<string, File>>(new Map());
  const cancelThumbnailRef = useRef<Map<string, () => void>>(new Map());

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  useEffect(() => {
    setQueue(prev => {
      const deletedList = Object.keys(prev).filter(id => !uploadEntities[id]);
      if (deletedList.length === 0) return prev;

      for (const id of deletedList) {
        cancelThumbnailRef.current.get(id)?.();
      }

      const next = { ...prev };
      for (const id of deletedList) delete next[id];
      return next;
    });
  }, [uploadEntities]);

  const generateThumbnailForFile = useCallback(
    async (file: File, id: string) => {
      let isCancelled = false;

      cancelThumbnailRef.current.set(id, () => {
        isCancelled = true;
      });

      try {
        const key = generateDbKey(file.name, file.size);
        let blob = await getCachedThumbnail(key);

        if (!blob) {
          if (isCancelled) return;
          blob = await generateThumbnail(file, () => isCancelled);
          cacheThumbnail(key, blob).catch(() => {});
        }

        if (isCancelled) return;

        dispatch(setThumbnail({ id, thumbnail: URL.createObjectURL(blob) }));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.warn('Thumbnail generation failed:', file.name, err);
      } finally {
        cancelThumbnailRef.current.delete(id);
      }
    },
    [dispatch],
  );

  const startUpload = useCallback(
    async (file: File, id: string) => {
      const controller = new AbortController();
      controllersRef.current.set(id, controller);
      filesRef.current.set(id, file);

      setQueue(prev => ({
        ...prev,
        [id]: { id, name: file.name, progress: 0, status: 'uploading', error: null },
      }));

      try {
        const { url } = await uploadFile(
          file,
          percent => {
            setQueue(prev => (prev[id] ? { ...prev, [id]: { ...prev[id], progress: percent } } : prev));
          },
          controller.signal,
        );

        dispatch(setUploadDone({ id, url }));
        removeFromQueue(id);
        filesRef.current.delete(id);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // cancel click
          dispatch(removeMediaItem(id));
          removeFromQueue(id);
          filesRef.current.delete(id);
        } else {
          dispatch(setUploadError(id));
          setQueue(prev =>
            prev[id]
              ? {
                  ...prev,
                  [id]: { ...prev[id], status: 'error', error: err instanceof Error ? err.message : 'Upload failed' },
                }
              : prev,
          );
        }
      } finally {
        controllersRef.current.delete(id);
      }
    },
    [dispatch, removeFromQueue],
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]): ValidationError[] => {
      const files = Array.from(fileList);
      const errors: ValidationError[] = [];

      if (files.length > MAX_FILES) {
        errors.push({ fileName: '', error: `Max ${MAX_FILES} files at once` });
        return errors;
      }

      const validFiles: File[] = [];

      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          errors.push({ fileName: file.name, error: 'Unsupported file type' });
        } else if (file.size > MAX_FILE_SIZE) {
          errors.push({ fileName: file.name, error: 'Exceeds 10 MB limit' });
        } else {
          validFiles.push(file);
        }
      }

      for (const file of validFiles) {
        const id = crypto.randomUUID();
        dispatch(startUploadItem(file, id));
        startUpload(file, id);
        generateThumbnailForFile(file, id);
      }

      return errors;
    },
    [dispatch, startUpload, generateThumbnailForFile],
  );

  const cancelUpload = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
  }, []);

  const retryUpload = useCallback(
    (id: string) => {
      const file = filesRef.current.get(id);
      if (!file) return;
      dispatch(setUploadRetry(id));
      startUpload(file, id);
    },
    [dispatch, startUpload],
  );

  return { handleFiles, cancelUpload, retryUpload, queue };
}
