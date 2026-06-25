import { describe, expect, it } from 'vitest';
import { DOMAINS } from './domains';
import { SHORT_TO_LONG_DOMAIN, normalizeDomainCode } from './domain-aliases';
import { getDomain } from './helpers';

const LONG_CODES = new Set(DOMAINS.map((d) => d.code));

describe('normalizeDomainCode', () => {
  it('maps backend SHORT codes to canonical LONG codes', () => {
    expect(normalizeDomainCode('ARITH')).toBe('ARITHMETIC');
    expect(normalizeDomainCode('FRACT')).toBe('FRACTIONS');
    expect(normalizeDomainCode('TRANSV')).toBe('TRANSVERSAL');
    expect(normalizeDomainCode('GEOM3D')).toBe('GEOMETRY_3D');
  });

  it('passes LONG codes through unchanged', () => {
    expect(normalizeDomainCode('ARITHMETIC')).toBe('ARITHMETIC');
    expect(normalizeDomainCode('COORD_GEOMETRY')).toBe('COORD_GEOMETRY');
  });

  it('returns an unknown code as-is (graceful fallback)', () => {
    expect(normalizeDomainCode('NOT_A_DOMAIN')).toBe('NOT_A_DOMAIN');
  });

  it('every SHORT alias resolves to a real Domain', () => {
    for (const [short, long] of Object.entries(SHORT_TO_LONG_DOMAIN)) {
      expect(LONG_CODES.has(long), `${short} → ${long} must exist in DOMAINS`).toBe(true);
      expect(getDomain(short)?.code).toBe(long);
    }
  });

  it('getDomain resolves SHORT and LONG to the same Domain', () => {
    expect(getDomain('FRACT')).toBe(getDomain('FRACTIONS'));
    expect(getDomain('ARITH')?.name_es).toBe('Aritmética con naturales');
  });
});
