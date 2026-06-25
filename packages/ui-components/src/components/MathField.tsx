'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from 'react';
import type { MathfieldElement } from 'mathlive';

/**
 * WYSIWYG math editor — a thin React wrapper over MathLive's `<math-field>` web
 * component. Teachers and students edit a formula visually (fractions, powers,
 * roots, %), never raw LaTeX, while the value stays LaTeX so it round-trips with
 * the KaTeX render path (`<MathText>` / `<Latex>`) and the backend pauta.
 *
 * MathLive touches `window` and registers a custom element on import, so the
 * module is loaded dynamically on the client only (never during SSR). The
 * element is registered once per page; React keeps the controlled value in sync
 * with `setValue(..., { silenceNotifications: true })` to avoid feedback loops.
 */
export interface MathFieldProps {
  /** Current formula as LaTeX (e.g. `\\frac{3}{4}+\\frac{2}{5}`). */
  readonly value: string;
  /** Called with the new LaTeX on every edit. Omit for a read-only render. */
  readonly onChange?: (latex: string) => void;
  /** When true the field is not editable (still typeset, still selectable). */
  readonly readOnly?: boolean;
  /** Hint shown when the field is empty. */
  readonly placeholder?: string;
  /** Accessible label (the field has no visible <label>). */
  readonly ariaLabel?: string;
  /** Extra classes for the box (border / radius / padding live here). */
  readonly className?: string;
}

// Register the custom element exactly once per page, lazily, on the client.
let registration: Promise<void> | null = null;
function ensureRegistered(): Promise<void> {
  if (registration) return registration;
  registration = import('mathlive').then((mod) => {
    // Classroom product: no key-press / "plonk" sounds.
    mod.MathfieldElement.soundsDirectory = null;
    // Serve the typeset fonts from the CDN so glyphs render without an asset
    // copy step. Self-host later by pointing this at a /public path.
    mod.MathfieldElement.fontsDirectory = 'https://cdn.jsdelivr.net/npm/mathlive/dist/fonts';
  });
  return registration;
}

// CSS custom properties MathLive reads, mapped onto our semantic tokens so the
// caret / selection track light & dark themes. Cast: these keys aren't in the
// React CSSProperties index but are valid CSS custom properties.
const THEME_VARS = {
  color: 'var(--fg-1)',
  '--caret-color': 'var(--primary)',
  '--selection-background-color': 'color-mix(in oklab, var(--primary) 18%, transparent)',
  '--contains-highlight-background-color': 'color-mix(in oklab, var(--primary) 10%, transparent)',
  '--placeholder-color': 'var(--fg-3)',
} as CSSProperties;

export function MathField({
  value,
  onChange,
  readOnly = false,
  placeholder,
  ariaLabel,
  className,
}: MathFieldProps): JSX.Element {
  const ref = useRef<MathfieldElement | null>(null);
  const [ready, setReady] = useState(false);

  // Keep latest callbacks/value in refs so the wiring effect runs once.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    void ensureRegistered().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once the element is upgraded, seed its value and listen for edits.
  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    el.setValue(valueRef.current, { silenceNotifications: true });
    const handler = (): void => onChangeRef.current?.(el.value);
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [ready]);

  // Push external value changes down without echoing an input event.
  useEffect(() => {
    const el = ref.current;
    if (ready && el && el.value !== value) {
      el.setValue(value, { silenceNotifications: true });
    }
  }, [ready, value]);

  // Reflect editable state + config imperatively (more reliable than attributes
  // before the element is upgraded).
  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    // Toggle via attribute (stable across MathLive versions) rather than a property.
    if (readOnly) el.setAttribute('read-only', 'true');
    else el.removeAttribute('read-only');
    el.mathVirtualKeyboardPolicy = 'auto';
    if (placeholder !== undefined) el.setAttribute('placeholder', placeholder);
  }, [ready, readOnly, placeholder]);

  return (
    // MathLive manages the element's own ARIA (it's an editable textbox); we only
    // supply a label and theme tokens.
    <math-field ref={ref} aria-label={ariaLabel} className={className} style={THEME_VARS} />
  );
}

declare global {
  // The `<math-field>` custom element, typed for JSX.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}
