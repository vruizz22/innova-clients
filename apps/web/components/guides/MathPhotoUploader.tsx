'use client';

import { useEffect, useMemo } from 'react';
import { CameraIcon, Dropzone, XIcon } from '@innova/ui';

export interface MathPhotoUploaderProps {
  readonly value: readonly File[];
  readonly onChange: (files: File[]) => void;
  readonly max?: number;
  readonly disabled?: boolean;
  readonly hideFooter?: boolean;
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
  hideFooter = false,
}: MathPhotoUploaderProps): JSX.Element {
  const previews = useMemo(() => value.map((f) => URL.createObjectURL(f)), [value]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const addFiles = (files: File[]): void => {
    const incoming = files.filter((f) => f.type.startsWith('image/'));
    onChange([...value, ...incoming].slice(0, max));
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="h-24 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                disabled={disabled}
                aria-label={`Quitar foto ${i + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white transition-transform hover:scale-105"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {value.length < max ? (
        <Dropzone
          accept="image/*"
          capture="environment"
          multiple
          disabled={disabled}
          onFiles={addFiles}
          className="!py-6"
        >
          <CameraIcon size={22} className="text-ink-subtle" />
          <span className="text-sm font-semibold text-ink-muted">
            {value.length === 0
              ? 'Arrastra fotos, toma una o haz clic para subir'
              : 'Agregar otra foto'}
          </span>
        </Dropzone>
      ) : null}
      {!hideFooter ? (
        <p className="text-xs text-ink-subtle">Hasta {max} fotos. Asegúrate de que se lea claro.</p>
      ) : null}
    </div>
  );
}
