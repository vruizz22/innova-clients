'use client';

import { Fragment, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface MathTextProps {
  /**
   * Mixed prose + LaTeX, where math is delimited by `$…$` (inline) or `$$…$$`
   * (display) — the format the guide extractor emits for statements, e.g.
   * `Calcula: $-8 + 5 - (-3)$.`. Plain prose (no delimiters) renders as text.
   */
  readonly children: string;
  readonly className?: string;
}

interface Segment {
  readonly type: 'text' | 'inline' | 'display';
  readonly value: string;
}

// `$$…$$` (display) must be tried before `$…$` (inline); `[^$]` keeps each match
// to a single segment so adjacent formulas don't merge.
const SEGMENT_RE = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;

function tokenize(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(SEGMENT_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) out.push({ type: 'text', value: text.slice(last, idx) });
    const tok = match[0];
    if (tok.startsWith('$$')) out.push({ type: 'display', value: tok.slice(2, -2) });
    else out.push({ type: 'inline', value: tok.slice(1, -1) });
    last = idx + tok.length;
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}

/**
 * Renders a statement as flowing text with inline/display KaTeX where `$…$`
 * delimiters appear. Unlike {@link Latex} (which treats its whole input as one
 * math formula), this keeps prose as prose so `$` signs never leak to the UI.
 * `throwOnError: false` degrades a bad formula to red source instead of crashing.
 */
export function MathText({ children, className }: MathTextProps): JSX.Element {
  const segments = useMemo(() => tokenize(children ?? ''), [children]);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <Fragment key={i}>{seg.value}</Fragment>;
        const html = katex.renderToString(seg.value, {
          displayMode: seg.type === 'display',
          throwOnError: false,
          errorColor: '#e11d48',
          output: 'html',
        });
        return (
          <span
            key={i}
            // KaTeX output is trusted markup generated from the LaTeX string (no script).
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
}
