import { DOMAINS } from './domains';

/**
 * The catalog has two coexisting domain-code conventions:
 *  - SHORT codes emitted by the live backend / ai-engine catalog (constantly
 *    growing toward ~2540 tags): ARITH, INT, FRACT, DEC, RATIO, ALGEBRA, POW,
 *    FUNC, GEOM, GEOM3D, TRIG, STAT, DATA, LOG, SEQ, COORD, TRANSV.
 *  - LONG codes used by the frontend taxonomy (domains.ts): ARITHMETIC,
 *    INTEGERS, FRACTIONS, DECIMALS, …
 *
 * Domains are FIXED by the v8 taxonomy (≤18 entries); only error *tags* grow.
 * So a tiny, stable short→long alias is the right thing to hardcode — a per-tag
 * map would drift on every catalog import. Tag identity and human names come
 * from the backend (`errorTagName`) at runtime, never from this package.
 */
export const SHORT_TO_LONG_DOMAIN: Readonly<Record<string, string>> = {
  ARITH: 'ARITHMETIC',
  INT: 'INTEGERS',
  FRACT: 'FRACTIONS',
  DEC: 'DECIMALS',
  RATIO: 'PROPORTIONS',
  ALGEBRA: 'ALGEBRA_LINEAR', // ai-engine emits one ALGEBRA; FE splits linear/quadratic
  POW: 'EXPONENTS_RADICALS',
  FUNC: 'FUNCTIONS',
  GEOM: 'GEOMETRY_PLANE',
  GEOM3D: 'GEOMETRY_3D',
  TRIG: 'TRIGONOMETRY',
  STAT: 'STATISTICS',
  DATA: 'DATA_HANDLING',
  LOG: 'LOGARITHMS',
  SEQ: 'SEQUENCES',
  COORD: 'COORD_GEOMETRY',
  TRANSV: 'TRANSVERSAL',
};

const LONG_CODES = new Set<string>(DOMAINS.map((d) => d.code));

/**
 * Resolve any backend/legacy domain code to the canonical long code used by
 * `DOMAINS`. Long codes pass through unchanged; an unknown code returns as-is so
 * callers can still render the raw code as a graceful fallback.
 */
export function normalizeDomainCode(code: string): string {
  if (LONG_CODES.has(code)) return code;
  return SHORT_TO_LONG_DOMAIN[code] ?? code;
}
