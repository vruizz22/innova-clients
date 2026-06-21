'use client';

import React from 'react';
import { GRADE_BANDS, type GradeBand } from '@innova/error-catalog';

interface GradeBandSelectorProps {
  value: string | null;
  onChange: (bandCode: string) => void;
  /** Restrict to the bands the teacher actually has courses in. Defaults to all. */
  bands?: readonly GradeBand[];
  className?: string;
}

/** Segmented control for the teacher multi-grade navigation (v8 C2.1). */
export function GradeBandSelector({
  value,
  onChange,
  bands = GRADE_BANDS,
  className = '',
}: GradeBandSelectorProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="Banda de grado"
      className={['inline-flex flex-wrap gap-1 rounded-full bg-[var(--surface-2)] p-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      {bands.map((band) => {
        const active = band.code === value;
        return (
          <button
            key={band.code}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(band.code)}
            title={band.short_es}
            className={[
              'min-h-[36px] rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-[0_1px_3px_rgba(15,42,61,0.1)]'
                : 'text-[var(--fg-2)] hover:text-[var(--fg-1)]',
            ].join(' ')}
          >
            {band.name_es}
          </button>
        );
      })}
    </div>
  );
}
