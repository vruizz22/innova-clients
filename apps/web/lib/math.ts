/**
 * Wraps bare LaTeX sequences in $…$ so MathText can render them.
 *
 * Rules (applied in order):
 *  1. No backslash → return as-is (plain text exercise, e.g. "53 - 26 = ?").
 *  2. Already has $…$ delimiters → return as-is (LLM already wrapped the math).
 *  3. Has ": " with LaTeX after it → wrap the post-colon portion: "Resuelve: \frac…" → "Resuelve: $\frac…$".
 *  4. Fallback: wrap each LaTeX command sequence individually.
 *
 * Using a callback in replace() avoids the $& vs $$&$ confusion in replacement strings.
 */
export function wrapMath(s: string): string {
  if (!s.includes('\\')) return s;
  if (s.includes('$')) return s;
  const colonIdx = s.indexOf(': ');
  if (colonIdx > 0 && s.slice(colonIdx + 2).includes('\\')) {
    return `${s.slice(0, colonIdx + 2)}$${s.slice(colonIdx + 2)}$`;
  }
  return s.replace(/\\[a-zA-Z]+(?:\{[^}]*\}|\[[^\]]*\])*/g, (m) => `$${m}$`);
}
