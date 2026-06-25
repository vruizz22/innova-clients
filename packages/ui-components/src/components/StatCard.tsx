import type { ReactNode } from 'react';
import { Card } from './Card';

export interface StatCardProps {
  readonly label: string;
  /** The main metric value — pass a ReactNode for custom formatting. Required unless `pending`. */
  readonly value?: ReactNode;
  /** Optional secondary value / denominator shown smaller after the main value. */
  readonly of?: ReactNode;
  /** Optional short description shown below the value. */
  readonly description?: string;
  /** Tailwind class applied to the value text (default: inherit). */
  readonly valueClass?: string;
  /** Show a pulsing skeleton placeholder instead of the value (data loading). */
  readonly pending?: boolean;
  readonly className?: string;
}

/**
 * Compact stat display: a small uppercase label + a large numeric or text value.
 * Use for dashboard summaries, cost metrics, progress counters, etc.
 *
 * ```tsx
 * <StatCard label="Unidades logradas" value={3} of={17} valueClass="text-[var(--success-fg)]" />
 * <StatCard label="Gasto hoy (USD)" pending />
 * ```
 */
export function StatCard({
  label,
  value,
  of: ofValue,
  description,
  valueClass = 'text-[var(--fg-1)]',
  pending = false,
  className,
}: StatCardProps): JSX.Element {
  return (
    <Card className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-2)]">{label}</p>
      {pending ? (
        <div className="mt-1 h-9 w-24 animate-pulse rounded-lg bg-[var(--surface-2)]" />
      ) : (
        <p className={['mt-1 text-3xl font-black tabular-nums', valueClass].join(' ')}>
          {value}
          {ofValue !== undefined ? (
            <span className="ml-1 text-base font-semibold text-[var(--fg-3)]">/ {ofValue}</span>
          ) : null}
        </p>
      )}
      {description ? (
        <p className="mt-1 text-xs text-[var(--fg-3)]">{description}</p>
      ) : null}
    </Card>
  );
}
