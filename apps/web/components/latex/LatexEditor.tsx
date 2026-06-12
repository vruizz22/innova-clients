'use client';

import { Latex } from './Latex';

export interface LatexEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly disabled?: boolean;
}

/**
 * Textarea + live KaTeX preview (C9 wizard). The LaTeX source stays the editable
 * value; the preview is read-only and updates as the teacher types.
 */
export function LatexEditor({
  value,
  onChange,
  label,
  placeholder = 'Escribe LaTeX…',
  rows = 3,
  disabled = false,
}: LatexEditorProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      ) : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />
      <div className="min-h-[2.5rem] rounded-xl bg-slate-50 px-3 py-2 text-slate-800">
        {value.trim().length > 0 ? (
          <Latex display>{value}</Latex>
        ) : (
          <span className="text-xs text-slate-400">Vista previa</span>
        )}
      </div>
    </div>
  );
}
