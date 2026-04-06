import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useUpload } from '@hooks/useUpload';
import type { ValidationError } from '@hooks/useUpload';
import { UploadItem } from './UploadItem';

export function UploadZone() {
  const { handleFiles, cancelUpload, retryUpload, queue } = useUpload();

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | File[]) => {
    const errors = handleFiles(fileList);
    setValidationErrors(errors);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const uploadItems = Object.values(queue);

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4"
          onChange={onInputChange}
          className="hidden"
        />
        <div className="text-sm font-medium text-slate-600">Click to upload or drag & drop</div>
        <div className="text-xs text-slate-400">JPEG, PNG, WebP, MP4 · Max 5 files · 10 MB each</div>
      </div>

      {validationErrors.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          {validationErrors.map((e, i) => (
            <div key={i} className="text-sm text-red-700">
              {e.fileName ? (
                <>
                  <span className="font-medium">{e.fileName}:</span> {e.error}
                </>
              ) : (
                e.error
              )}
            </div>
          ))}
        </div>
      )}

      {uploadItems.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploadItems.map(item => (
            <UploadItem
              key={item.id}
              item={item}
              onCancel={() => cancelUpload(item.id)}
              onRetry={() => retryUpload(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
