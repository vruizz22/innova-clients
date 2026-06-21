'use client';

import React from 'react';
import {
  formatHumanName,
  getErrorTag,
  type ErrorTag,
  type Severity,
} from '@innova/error-catalog';

interface ErrorTagChipProps {
  code: string;
  /** Pass the resolved tag to avoid a lookup (e.g. seed-driven lists). */
  tag?: ErrorTag;
  showCode?: boolean;
  onClick?: () => void;
  className?: string;
}

// Procedural errors are amber, never alarm red (design system principle #4).
// rgba tints layer over light/dark surfaces; text uses --fg-1 so it stays
// legible on both themes (a fixed dark ink would vanish in dark mode).
const SEVERITY_STYLES: Record<Severity, string> = {
  LOW: 'bg-[rgba(232,163,61,0.14)] text-[var(--fg-1)] border-[rgba(232,163,61,0.30)]',
  MEDIUM: 'bg-[rgba(232,163,61,0.22)] text-[var(--fg-1)] border-[rgba(232,163,61,0.40)]',
  HIGH: 'bg-[rgba(216,96,96,0.20)] text-[var(--fg-1)] border-[rgba(216,96,96,0.40)]',
};

export function ErrorTagChip({
  code,
  tag,
  showCode = false,
  onClick,
  className = '',
}: ErrorTagChipProps): JSX.Element {
  const resolved = tag ?? getErrorTag(code);
  const deprecated = resolved?.status === 'DEPRECATED';
  const styles = deprecated
    ? 'bg-[var(--surface-2)] text-[var(--fg-3)] border-[var(--border)] line-through'
    : SEVERITY_STYLES[resolved?.severity ?? 'MEDIUM'];
  const label = showCode ? code : formatHumanName(code);
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      {...(onClick ? { type: 'button', onClick } : {})}
      title={resolved?.description_es ?? code}
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        styles,
        onclickable(onClick),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {resolved?.status === 'DRAFT' ? (
        <span className="rounded bg-[var(--info-bg)] px-1 text-[10px] font-bold text-[var(--info-fg)]">
          DRAFT
        </span>
      ) : null}
      {label}
    </Tag>
  );
}

function onclickable(onClick?: () => void): string {
  return onClick ? 'cursor-pointer hover:brightness-95' : '';
}
