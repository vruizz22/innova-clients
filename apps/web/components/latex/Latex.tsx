'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface LatexProps {
  /** Raw LaTeX (without surrounding $…$). */
  readonly children: string;
  /** Block (centered, display) vs inline. */
  readonly display?: boolean;
  readonly className?: string;
}

/**
 * Renders LaTeX with KaTeX. `throwOnError: false` degrades to the raw source in
 * red rather than crashing the wizard/quiz when the pipeline emits odd markup.
 */
export function Latex({ children, display = false, className }: LatexProps): JSX.Element {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        displayMode: display,
        throwOnError: false,
        errorColor: '#e11d48',
        output: 'html',
      }),
    [children, display]
  );

  return (
    <span
      className={className}
      // KaTeX output is trusted markup generated from the LaTeX string (no script).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
