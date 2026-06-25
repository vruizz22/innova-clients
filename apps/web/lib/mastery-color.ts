// Shared mastery color scale (CLAUDE.md §6): green ≥0.7, yellow 0.4–0.7, red <0.4.
export type MasteryLevel = 'high' | 'mid' | 'low';

export function masteryLevel(pKnown: number): MasteryLevel {
  if (pKnown >= 0.7) return 'high';
  if (pKnown >= 0.4) return 'mid';
  return 'low';
}

// Cell fills use the exact DS mastery tokens (#3DAA72 / #E8A33D / #D86060) — never an
// alarm red. Amber keeps a dark-brown ink for AA contrast; green/rose carry white.
export const MASTERY_CELL_BG: Record<MasteryLevel, string> = {
  high: 'bg-mastery-strong text-white',
  mid: 'bg-mastery-medium text-[#4a3300]',
  low: 'bg-mastery-weak text-white',
};

export const MASTERY_SOFT_BG: Record<MasteryLevel, string> = {
  high: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
  mid: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
  low: 'bg-danger/15 text-danger',
};

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  high: 'Logrado',
  mid: 'En progreso',
  low: 'Por reforzar',
};
