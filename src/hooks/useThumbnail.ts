import { useCallback, useRef } from 'react';
import { useAppDispatch } from '@store/hooks';
import { setThumbnail } from '@store/slices/uploadSlice';
import { generateThumbnail } from '@utils/generateThumbnail';
import { getCachedThumbnail, cacheThumbnail, generateDbKey } from '@utils/thumbnailCache';

export function useThumbnail() {
  const dispatch = useAppDispatch();
  const cancelRef = useRef<Map<string, () => void>>(new Map());

  const generate = useCallback(
    async (file: File, id: string) => {
      let isCancelled = false;
      cancelRef.current.set(id, () => {
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
        cancelRef.current.delete(id);
      }
    },
    [dispatch],
  );

  const cancel = useCallback((id: string) => {
    cancelRef.current.get(id)?.();
  }, []);

  return { generate, cancel };
}
