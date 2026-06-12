import { describe, it, expect } from 'vitest';
import { evalArithmetic, problemFromExpression } from './arithmetic';

describe('evalArithmetic', () => {
  it('evaluates basic subtraction', () => {
    expect(evalArithmetic('345 - 178')).toBe(167);
  });

  it('handles unicode operators (× ÷ −)', () => {
    expect(evalArithmetic('12 × 3')).toBe(36);
    expect(evalArithmetic('20 ÷ 4')).toBe(5);
    expect(evalArithmetic('9 − 4')).toBe(5);
  });

  it('respects precedence and parentheses', () => {
    expect(evalArithmetic('2 + 3 × 4')).toBe(14);
    expect(evalArithmetic('(2 + 3) × 4')).toBe(20);
  });

  it('parses Chilean decimal comma', () => {
    expect(evalArithmetic('1,5 + 2,5')).toBe(4);
  });

  it('handles unary minus', () => {
    expect(evalArithmetic('-5 + 8')).toBe(3);
  });

  it('rounds float noise', () => {
    expect(evalArithmetic('0.1 + 0.2')).toBe(0.3);
  });

  it('returns null on division by zero', () => {
    expect(evalArithmetic('5 / 0')).toBeNull();
  });

  it('returns null on unsupported input (variables, exponents)', () => {
    expect(evalArithmetic('x + 2')).toBeNull();
    expect(evalArithmetic('2 ^ 3')).toBeNull();
    expect(evalArithmetic('')).toBeNull();
    expect(evalArithmetic('()')).toBeNull();
  });

  it('returns null on malformed expressions', () => {
    expect(evalArithmetic('3 +')).toBeNull();
    expect(evalArithmetic('3 4')).toBeNull();
    expect(evalArithmetic('(3 + 4')).toBeNull();
  });
});

describe('problemFromExpression', () => {
  it('strips a trailing answer', () => {
    expect(problemFromExpression('345 - 178 = 167')).toBe('345 - 178');
  });

  it('leaves a bare problem untouched', () => {
    expect(problemFromExpression('345 - 178')).toBe('345 - 178');
  });
});
