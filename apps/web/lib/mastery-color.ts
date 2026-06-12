// Shared mastery color scale (CLAUDE.md §6): green ≥0.7, yellow 0.4–0.7, red <0.4.
export type MasteryLevel = 'high' | 'mid' | 'low';

export function masteryLevel(pKnown: number): MasteryLevel {
  if (pKnown >= 0.7) return 'high';
  if (pKnown >= 0.4) return 'mid';
  return 'low';
}

export const MASTERY_CELL_BG: Record<MasteryLevel, string> = {
  high: 'bg-emerald-500 text-white',
  mid: 'bg-amber-400 text-amber-950',
  low: 'bg-rose-500 text-white',
};

export const MASTERY_SOFT_BG: Record<MasteryLevel, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  mid: 'bg-amber-100 text-amber-800',
  low: 'bg-rose-100 text-rose-700',
};

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  high: 'Logrado',
  mid: 'En progreso',
  low: 'Por reforzar',
};
