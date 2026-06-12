import type { Grade, GradeBand } from './types';

/**
 * Grade bands for the teacher multi-grade selector (v8 C2.1).
 * Aligned to G1–G12 (G9 = 1° medio … G12 = 4° medio), matching the real
 * catalog in innova-ai-engine/out/catalog.
 */
export const GRADE_BANDS: readonly GradeBand[] = [
  { code: 'BASICA_BAJA', name_es: 'Básica baja', short_es: '1°–4° básico', grades: ['G1', 'G2', 'G3', 'G4'] },
  { code: 'BASICA_ALTA', name_es: 'Básica alta', short_es: '5°–6° básico', grades: ['G5', 'G6'] },
  { code: 'SEPTIMO_OCTAVO', name_es: '7°–8° básico', short_es: '7°–8° básico', grades: ['G7', 'G8'] },
  { code: 'MEDIA_1_2', name_es: '1°–2° medio', short_es: '1°–2° medio', grades: ['G9', 'G10'] },
  { code: 'MEDIA_3_4', name_es: '3°–4° medio', short_es: '3°–4° medio', grades: ['G11', 'G12'] },
] as const;

const GRADE_LABELS: Record<Grade, string> = {
  G1: '1° básico',
  G2: '2° básico',
  G3: '3° básico',
  G4: '4° básico',
  G5: '5° básico',
  G6: '6° básico',
  G7: '7° básico',
  G8: '8° básico',
  G9: '1° medio',
  G10: '2° medio',
  G11: '3° medio',
  G12: '4° medio',
};

export function gradeLabel(grade: Grade): string {
  return GRADE_LABELS[grade];
}

export function getGradeBand(grade: Grade): GradeBand | undefined {
  return GRADE_BANDS.find((band) => band.grades.includes(grade));
}
