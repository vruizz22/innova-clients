'use client';

import React, { useCallback, useRef, useState } from 'react';

interface DropzoneProps {
  /** Receives validated File objects (already sliced to one when `multiple` is false). */
  readonly onFiles: (files: File[]) => void;
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly children: React.ReactNode;
  /** Forwarded to the input — e.g. "environment" to open the rear camera on mobile. */
  readonly capture?: boolean | 'user' | 'environment';
}

/**
 * Accessible drag-and-drop file area. Click or keyboard (Enter/Space) opens the
 * native picker; dragging a file highlights the zone. Theme-aware via semantic
 * tokens, so it works in light and dark. Drag-depth counter avoids flicker when
 * the pointer crosses child elements.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  className = '',
  children,
  capture,
}: DropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const open = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const emit = useCallback(
    (list: FileList | null) => {
      const files = Array.from(list ?? []);
      if (files.length === 0) return;
      onFiles(multiple ? files : files.slice(0, 1));
    },
    [multiple, onFiles]
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        if (!disabled) setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (!disabled) emit(e.dataTransfer.files);
      }}
      className={[
        'flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-150',
        dragging
          ? 'border-brand bg-canvas-student'
          : 'border-line-strong bg-surface hover:border-brand',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        {...(capture !== undefined ? { capture } : {})}
        className="hidden"
        onChange={(e) => {
          emit(e.target.files);
          e.target.value = '';
        }}
      />
      {children}
    </div>
  );
}
