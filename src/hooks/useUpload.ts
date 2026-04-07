import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setUploadDone, setUploadError, setUploadRetry, selectUploadEntities } from '@store/slices/uploadSlice';
import { startUploadItem, removeMediaItem } from '@store/thunks';
import { uploadFile } from '@api/mediaApi';
import { useThumbnail } from './useThumbnail';

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
  const { generate: generateThumbnail, cancel: cancelThumbnail } = useThumbnail();

  const [queue, setQueue] = useState<Record<string, ActiveUpload>>({});
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const filesRef = useRef<Map<string, File>>(new Map());

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)));
  }, []);

  useEffect(() => {
    setQueue(prev => {
      const deletedList = Object.keys(prev).filter(id => !uploadEntities[id]);
      if (deletedList.length === 0) return prev;
      const next = { ...prev };
      for (const id of deletedList) {
        cancelThumbnail(id);
        delete next[id];
      }
      return next;
    });
  }, [uploadEntities, cancelThumbnail]);

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
        generateThumbnail(file, id);
      }

      return errors;
    },
    [dispatch, startUpload, generateThumbnail],
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
