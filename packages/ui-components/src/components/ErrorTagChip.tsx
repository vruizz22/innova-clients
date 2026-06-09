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
const SEVERITY_STYLES: Record<Severity, string> = {
  LOW: 'bg-[#FFFBF0] text-[#7A4F00] border-[#F0D9A0]',
  MEDIUM: 'bg-[#FFF4DB] text-[#7A4F00] border-[#F0D9A0]',
  HIGH: 'bg-[#FCE3E3] text-[#7a1a1a] border-[#f5b8b8]',
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
    ? 'bg-[#F7F8FA] text-[#717A8B] border-[#CDD3DD] line-through'
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
        <span className="rounded bg-[#DCEDF6] px-1 text-[10px] font-bold text-[#18506D]">
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
