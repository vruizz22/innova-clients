/**
 * Tiny safe arithmetic evaluator for OCR'd problem statements (no `eval`).
 *
 * Covers the 3°–6° básico surface: + − × ÷ over decimals with parentheses, using
 * a recursive-descent parser. Returns null for anything it cannot parse cleanly,
 * so callers can fall back to a manual "respuesta correcta" field. It deliberately
 * does NOT support exponents, variables or functions — those route to the backend
 * LLM path instead of being guessed client-side.
 */

type Token =
  | { readonly kind: 'num'; readonly value: number }
  | { readonly kind: 'op'; readonly value: '+' | '-' | '*' | '/' }
  | { readonly kind: 'lparen' }
  | { readonly kind: 'rparen' };

/** Normalises unicode math glyphs to ASCII operators (whitespace preserved). */
function normalize(expr: string): string {
  return expr
    .replace(/[×·*]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/,/g, '.'); // Chilean decimal comma → point
}

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i] as string;
    if (ch === ' ' || ch === '\t') {
      i += 1; // whitespace separates tokens; never merges two numbers
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i] as string)) {
        num += expr[i];
        i += 1;
      }
      const value = Number(num);
      if (!Number.isFinite(value)) return null;
      tokens.push({ kind: 'num', value });
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ kind: 'op', value: ch });
      i += 1;
      continue;
    }
    if (ch === '(') {
      tokens.push({ kind: 'lparen' });
      i += 1;
      continue;
    }
    if (ch === ')') {
      tokens.push({ kind: 'rparen' });
      i += 1;
      continue;
    }
    return null; // unsupported character
  }
  return tokens;
}

/** Recursive-descent parser: expr = term (('+'|'-') term)*, term = factor (('*'|'/') factor)*. */
class Parser {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  parse(): number | null {
    const result = this.expr();
    if (result === null || this.pos !== this.tokens.length) return null;
    return result;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private expr(): number | null {
    let left = this.term();
    if (left === null) return null;
    for (let op = this.peek(); op?.kind === 'op' && (op.value === '+' || op.value === '-'); op = this.peek()) {
      this.pos += 1;
      const right = this.term();
      if (right === null) return null;
      left = op.value === '+' ? left + right : left - right;
    }
    return left;
  }

  private term(): number | null {
    let left = this.factor();
    if (left === null) return null;
    for (let op = this.peek(); op?.kind === 'op' && (op.value === '*' || op.value === '/'); op = this.peek()) {
      this.pos += 1;
      const right = this.factor();
      if (right === null) return null;
      if (op.value === '/' && right === 0) return null;
      left = op.value === '*' ? left * right : left / right;
    }
    return left;
  }

  private factor(): number | null {
    const tok = this.peek();
    if (tok === undefined) return null;
    if (tok.kind === 'num') {
      this.pos += 1;
      return tok.value;
    }
    if (tok.kind === 'op' && (tok.value === '+' || tok.value === '-')) {
      this.pos += 1; // unary +/-
      const operand = this.factor();
      if (operand === null) return null;
      return tok.value === '-' ? -operand : operand;
    }
    if (tok.kind === 'lparen') {
      this.pos += 1;
      const inner = this.expr();
      if (inner === null) return null;
      if (this.peek()?.kind !== 'rparen') return null;
      this.pos += 1;
      return inner;
    }
    return null;
  }
}

/**
 * Evaluates a problem expression like "53 - 26" or "12 × (3 + 4)".
 * Rounds to 6 decimals to absorb float noise. Returns null when it can't parse.
 */
export function evalArithmetic(expr: string): number | null {
  const normalized = normalize(expr);
  if (normalized.length === 0) return null;
  const tokens = tokenize(normalized);
  if (tokens === null || tokens.length === 0) return null;
  const result = new Parser(tokens).parse();
  if (result === null || !Number.isFinite(result)) return null;
  return Math.round(result * 1e6) / 1e6;
}

/** Strips a trailing "= …" answer from an OCR'd line, leaving just the problem. */
export function problemFromExpression(expression: string): string {
  const left = expression.split('=')[0];
  return (left ?? expression).trim();
}
