'use client';

import { useEffect, useMemo, useRef } from 'react';

export interface MathPhotoUploaderProps {
  readonly value: readonly File[];
  readonly onChange: (files: File[]) => void;
  readonly max?: number;
  readonly disabled?: boolean;
}

/**
 * Web photo capture for handwritten work (1-3 images). On native this becomes
 * expo-camera (packages/upload-scanner, C13). `capture="environment"` opens the
 * rear camera on mobile-web.
 */
export function MathPhotoUploader({
  value,
  onChange,
  max = 3,
  disabled = false,
}: MathPhotoUploaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => value.map((f) => URL.createObjectURL(f)), [value]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const addFiles = (files: FileList | null): void => {
    if (!files) return;
    const incoming = Array.from(files).filter((f) => f.type.startsWith('image/'));
    onChange([...value, ...incoming].slice(0, max));
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} className="h-24 w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                disabled={disabled}
                aria-label={`Quitar foto ${i + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {value.length < max ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-600 hover:border-sky-300 disabled:opacity-50"
        >
          <span className="text-2xl">📷</span>
          {value.length === 0 ? 'Toma o sube una foto' : 'Agregar otra foto'}
        </button>
      ) : null}
      <p className="text-xs text-slate-400">Hasta {max} fotos. Asegúrate de que se lea claro.</p>
    </div>
  );
}
