import { MASTERY_LABEL, type MasteryLevel } from '@/lib/mastery-color';

const LEVELS: readonly { readonly level: MasteryLevel; readonly dot: string }[] = [
  { level: 'high', dot: 'bg-mastery-strong' },
  { level: 'mid', dot: 'bg-mastery-medium' },
  { level: 'low', dot: 'bg-mastery-weak' },
];

/**
 * Color legend for mastery heatmaps — verde logrado / ámbar en progreso / rosa por
 * reforzar (DS mastery scale, never alarm red). Shared by the dashboard inline heatmap
 * and the full Student × Unit view so the color coding is never ambiguous.
 */
export function MasteryLegend({ className = '' }: { readonly className?: string }): JSX.Element {
  return (
    <ul
      className={['flex flex-wrap items-center gap-x-4 gap-y-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {LEVELS.map(({ level, dot }) => (
        <li key={level} className="flex items-center gap-1.5 text-xs text-[var(--fg-2)]">
          <span className={['h-2.5 w-2.5 rounded-full', dot].join(' ')} aria-hidden="true" />
          {MASTERY_LABEL[level]}
        </li>
      ))}
    </ul>
  );
}
