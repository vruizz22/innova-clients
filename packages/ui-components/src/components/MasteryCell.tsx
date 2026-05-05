import React from 'react';

interface MasteryCellProps {
  pKnown: number; // 0–1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

function getMasteryColor(p: number): { bg: string; text: string } {
  if (p >= 0.7) return { bg: 'rgba(61,170,114,0.18)', text: '#226B47' };
  if (p >= 0.4) return { bg: 'rgba(232,163,61,0.18)', text: '#7A4F00' };
  return { bg: 'rgba(216,96,96,0.18)', text: '#7a1a1a' };
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

export function MasteryCell({
  pKnown,
  label,
  size = 'md',
  'data-testid': testId,
}: MasteryCellProps): JSX.Element {
  const clamped = Math.min(1, Math.max(0, pKnown));
  const { bg, text } = getMasteryColor(clamped);
  const display = clamped.toFixed(1);

  return (
    <div
      data-testid={testId}
      title={label ?? `p_known: ${display}`}
      className={[
        'inline-flex items-center justify-center rounded-lg font-bold',
        sizeClasses[size],
      ].join(' ')}
      style={{ backgroundColor: bg, color: text }}
    >
      {display}
    </div>
  );
}
