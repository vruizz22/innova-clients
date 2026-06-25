'use client';

import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { MathField } from '@innova/ui';
import { MathText } from './MathText';

export interface LatexEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly disabled?: boolean;
  /**
   * When true, the value is prose + inline `$…$` math (a statement) and is edited
   * as text with a live {@link MathText} preview. Default false: the value is one
   * pure-math formula (a step / answer) edited visually with {@link MathField}.
   */
  readonly mixed?: boolean;
}

/**
 * Friendly math editor for the guide wizard. Formulas (steps, answers) are edited
 * visually with MathLive — no raw LaTeX — with a collapsible source escape hatch.
 * Statements (prose + `$…$`) keep a textarea since MathLive edits a single formula,
 * not mixed text. The render path stays KaTeX everywhere.
 */
export function LatexEditor({
  value,
  onChange,
  label,
  placeholder,
  rows = 3,
  disabled = false,
  mixed = false,
}: LatexEditorProps): JSX.Element {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
          {label}
        </span>
      ) : null}

      {mixed ? (
        <>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? 'Escribe el enunciado. Usa $…$ para la parte matemática.'}
            rows={rows}
            disabled={disabled}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--info-bg)]"
          />
          <div className="min-h-[2.5rem] rounded-xl bg-[var(--surface-2)] px-3 py-2 text-[var(--fg-1)]">
            {value.trim().length > 0 ? (
              <MathText>{value}</MathText>
            ) : (
              <span className="text-xs text-[var(--fg-3)]">Vista previa</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 transition-colors focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--info-bg)]">
            <MathField
              value={value}
              onChange={onChange}
              readOnly={disabled}
              ariaLabel={label ?? 'Editor de fórmula'}
              {...(placeholder !== undefined ? { placeholder } : {})}
              className="block min-h-[2.5rem] w-full border-0 bg-transparent text-lg outline-none"
            />
          </div>
          <details
            open={showSource}
            onToggle={(e) => setShowSource((e.currentTarget as HTMLDetailsElement).open)}
            className="group"
          >
            <summary className="inline-flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-medium text-[var(--fg-3)] transition-colors hover:text-[var(--fg-2)]">
              <Code2 className="h-3.5 w-3.5" />
              {showSource ? 'Ocultar LaTeX' : 'Editar como LaTeX'}
            </summary>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ej: \dfrac{3}{4} + \dfrac{2}{5}"
              rows={2}
              disabled={disabled}
              className="mt-1.5 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-mono text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--primary)]"
            />
          </details>
        </>
      )}
    </div>
  );
}
