'use client';

import React from 'react';

export type KeypadKey =
  | { readonly kind: 'char'; readonly value: string; readonly label: string }
  | { readonly kind: 'backspace' }
  | { readonly kind: 'clear' };

export interface MathKeypadProps {
  /** Append a character to the active field. */
  onChar: (char: string) => void;
  /** Remove the last character of the active field. */
  onBackspace: () => void;
  /** Clear the active field. */
  onClear: () => void;
  disabled?: boolean;
}

const DIGIT =
  'bg-[var(--surface)] text-[var(--fg-1)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] border-[var(--border)]';
const OP = 'bg-[var(--info-bg)] text-sky-700 hover:bg-sky-100 active:bg-sky-200 border-sky-200';
const CTRL = 'bg-amber-50 text-amber-700 hover:bg-amber-100 active:bg-amber-200 border-amber-200';

// 4-col layout: digits + the arithmetic operators a student needs to write a full
// expression like "53 − 26 = 27". Plain numeric strings — no LaTeX (MVP, §9).
const ROWS: ReadonlyArray<ReadonlyArray<KeypadKey>> = [
  [
    { kind: 'char', value: '7', label: '7' },
    { kind: 'char', value: '8', label: '8' },
    { kind: 'char', value: '9', label: '9' },
    { kind: 'char', value: '÷', label: '÷' },
  ],
  [
    { kind: 'char', value: '4', label: '4' },
    { kind: 'char', value: '5', label: '5' },
    { kind: 'char', value: '6', label: '6' },
    { kind: 'char', value: '×', label: '×' },
  ],
  [
    { kind: 'char', value: '1', label: '1' },
    { kind: 'char', value: '2', label: '2' },
    { kind: 'char', value: '3', label: '3' },
    { kind: 'char', value: '−', label: '−' },
  ],
  [
    { kind: 'char', value: '0', label: '0' },
    { kind: 'char', value: '.', label: '.' },
    { kind: 'char', value: '=', label: '=' },
    { kind: 'char', value: '+', label: '+' },
  ],
];

function keyClass(key: KeypadKey): string {
  if (key.kind === 'char') return /[0-9.]/.test(key.value) ? DIGIT : OP;
  return CTRL;
}

/**
 * Virtual numeric keypad. Large touch targets (h-14 ≈ 56px ≥ 44px) and high
 * contrast for accessibility. Buttons use `type="button"` so they never submit
 * the surrounding form. Native keyboards still work via `inputmode="decimal"`.
 */
export function MathKeypad({
  onChar,
  onBackspace,
  onClear,
  disabled,
}: MathKeypadProps): JSX.Element {
  function press(key: KeypadKey): void {
    if (disabled) return;
    if (key.kind === 'char') onChar(key.value);
    else if (key.kind === 'backspace') onBackspace();
    else onClear();
  }

  return (
    <div className="grid grid-cols-4 gap-2" role="group" aria-label="Teclado numérico">
      {ROWS.flatMap((row, r) =>
        row.map((key, c) => (
          <button
            key={`${r}-${c}`}
            type="button"
            disabled={disabled}
            onClick={() => press(key)}
            aria-label={
              key.kind === 'char' ? key.label : key.kind === 'backspace' ? 'Borrar' : 'Limpiar'
            }
            className={[
              'h-14 rounded-xl border text-xl font-bold tabular-nums transition-colors',
              'disabled:opacity-40 disabled:pointer-events-none',
              keyClass(key),
            ].join(' ')}
          >
            {key.kind === 'char' ? key.label : ''}
          </button>
        ))
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => press({ kind: 'backspace' })}
        aria-label="Borrar último carácter"
        className={[
          'col-span-2 h-12 rounded-xl border text-base font-semibold transition-colors',
          CTRL,
        ].join(' ')}
      >
        ⌫ Borrar
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => press({ kind: 'clear' })}
        aria-label="Limpiar la línea"
        className={[
          'col-span-2 h-12 rounded-xl border text-base font-semibold transition-colors',
          CTRL,
        ].join(' ')}
      >
        Limpiar
      </button>
    </div>
  );
}
