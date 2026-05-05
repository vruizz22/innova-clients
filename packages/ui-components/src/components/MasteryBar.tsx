import React from 'react';

interface MasteryBarProps {
  pKnown: number; // 0–1
  label?: string;
  showValue?: boolean;
  className?: string;
}

function getMasteryColor(p: number): string {
  if (p >= 0.7) return '#3DAA72'; // mint-500
  if (p >= 0.4) return '#E8A33D'; // mastery-medium
  return '#D86060';               // mastery-weak
}

function getMasteryLabel(p: number): string {
  if (p >= 0.7) return 'Dominado';
  if (p >= 0.4) return 'En proceso';
  return 'En riesgo';
}

export function MasteryBar({
  pKnown,
  label,
  showValue = false,
  className = '',
}: MasteryBarProps): JSX.Element {
  const clamped = Math.min(1, Math.max(0, pKnown));
  const pct = Math.round(clamped * 100);
  const color = getMasteryColor(clamped);
  const masteryLabel = getMasteryLabel(clamped);

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      {(label != null || showValue) ? (
        <div className="flex items-center justify-between text-xs">
          {label ? <span className="text-[#1F2937] font-medium">{label}</span> : null}
          {showValue ? (
            <span className="text-[#4F5868]">{pct}% · {masteryLabel}</span>
          ) : null}
        </div>
      ) : null}
      <div
        className="w-full h-2 rounded-full bg-[#E5E9F0] overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? masteryLabel}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
