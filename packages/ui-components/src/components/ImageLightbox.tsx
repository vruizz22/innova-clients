'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { XIcon } from '../icons';

export interface ImageLightboxProps {
  /** Whether the viewer is open. */
  readonly open: boolean;
  /** Image URL to display; when null the viewer renders nothing. */
  readonly src: string | null;
  readonly alt?: string;
  readonly onClose: () => void;
}

// DS motion: ease-out, ~180ms — no bounce. Reduced motion → crossfade only.
const EASE_STANDARD = [0.2, 0.8, 0.2, 1] as const;

/**
 * Tap-to-expand image viewer: dims everything behind a dark backdrop and centers
 * the image, with a soft scale/fade in. A tap on the backdrop, the close button,
 * or Escape dismisses it; body scroll is locked while open. Shared by the scan
 * flows and the teacher attempt/submission detail.
 */
export function ImageLightbox({
  open,
  src,
  alt = '',
  onClose,
}: ImageLightboxProps): JSX.Element {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && src ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt || 'Imagen ampliada'}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE_STANDARD }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
          >
            <XIcon size={22} />
          </button>
          <motion.img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE_STANDARD }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
