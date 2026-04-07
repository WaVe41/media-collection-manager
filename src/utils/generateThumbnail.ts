export const THUMB_SIZE = 200;

const drawScaledImage = (
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLVideoElement,
  srcW: number,
  srcH: number,
): void => {
  const scale = Math.max(THUMB_SIZE / srcW, THUMB_SIZE / srcH);
  const scaledW = srcW * scale;
  const scaledH = srcH * scale;
  const offsetX = (THUMB_SIZE - scaledW) / 2;
  const offsetY = (THUMB_SIZE - scaledH) / 2;
  ctx.drawImage(source, offsetX, offsetY, scaledW, scaledH);
};

async function drawCanvasToBlob(
  source: HTMLImageElement | HTMLVideoElement,
  srcW: number,
  srcH: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = THUMB_SIZE;
  canvas.height = THUMB_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');
  drawScaledImage(ctx, source, srcW, srcH);
  try {
    return await new Promise((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.8),
    );
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

async function generateImageThumbnail(file: File, cancelled: () => boolean): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });

    if (cancelled()) throw new DOMException('Aborted', 'AbortError');

    return await drawCanvasToBlob(img, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function generateVideoThumbnail(file: File, cancelled: () => boolean): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');

  video.style.cssText = 'position:fixed;visibility:hidden;top:-9999px;pointer-events:none';
  document.body.appendChild(video);

  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = reject;
      video.src = objectUrl;
    });

    if (cancelled()) throw new DOMException('Aborted', 'AbortError');

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error('Video has no renderable dimensions');
    }

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = reject;
      video.currentTime = 0.01;
    });

    if (cancelled()) throw new DOMException('Aborted', 'AbortError');

    return await drawCanvasToBlob(video, video.videoWidth, video.videoHeight);
  } finally {
    document.body.removeChild(video);
    URL.revokeObjectURL(objectUrl);
  }
}

export async function generateThumbnail(file: File, cancelled: () => boolean): Promise<Blob> {
  if (file.type.startsWith('image/')) return generateImageThumbnail(file, cancelled);
  if (file.type.startsWith('video/')) return generateVideoThumbnail(file, cancelled);
  throw new Error(`Not supported type: ${file.type}`);
}
