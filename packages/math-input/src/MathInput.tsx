'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MathKeypad } from './MathKeypad';
import type { ActiveField, MathInputResult, StepInput } from './types';

export interface MathInputProps {
  /** The exercise prompt, e.g. "345 − 178". Rendered read-only above the input. */
  problem: string;
  /** Called when the student submits a non-empty final answer. */
  onSubmit: (result: MathInputResult) => void;
  /** Disables inputs + submit while the attempt is in flight. */
  submitting?: boolean;
  /** Label for the submit button. */
  submitLabel?: string;
}

interface WorkingStep {
  value: string;
  startedAt: number;
}

const FIELD =
  'math w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-2xl font-black tabular-nums text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

/**
 * Numeric step-input for student practice. Students may add intermediate working
 * lines to "show their work", then enter a final answer. Output maps directly onto
 * POST /attempts `rawSteps` (each working line + the final answer with isFinal).
 */
export function MathInput({ problem, onSubmit, submitting = false, submitLabel = 'Enviar respuesta' }: MathInputProps): JSX.Element {
  const startedAtRef = useRef<number>(Date.now());
  const [steps, setSteps] = useState<WorkingStep[]>([]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [active, setActive] = useState<ActiveField>({ kind: 'final' });

  const setActiveValue = useCallback(
    (transform: (current: string) => string) => {
      if (active.kind === 'final') {
        setFinalAnswer((v) => transform(v));
        return;
      }
      const idx = active.index;
      setSteps((rows) => rows.map((row, i) => (i === idx ? { ...row, value: transform(row.value) } : row)));
    },
    [active]
  );

  const onChar = useCallback((char: string) => setActiveValue((v) => v + char), [setActiveValue]);
  const onBackspace = useCallback(() => setActiveValue((v) => v.slice(0, -1)), [setActiveValue]);
  const onClear = useCallback(() => setActiveValue(() => ''), [setActiveValue]);

  function addStep(): void {
    setSteps((rows) => {
      const next = [...rows, { value: '', startedAt: Date.now() }];
      setActive({ kind: 'step', index: next.length - 1 });
      return next;
    });
  }

  function removeStep(index: number): void {
    setSteps((rows) => rows.filter((_, i) => i !== index));
    setActive({ kind: 'final' });
  }

  const canSubmit = useMemo(() => finalAnswer.trim().length > 0 && !submitting, [finalAnswer, submitting]);

  function handleSubmit(): void {
    if (!canSubmit) return;
    const now = Date.now();
    const cleanSteps: StepInput[] = steps
      .map((s, i) => ({ value: s.value.trim(), stepIndex: i, durationMs: now - s.startedAt }))
      .filter((s) => s.value.length > 0);
    onSubmit({
      steps: cleanSteps,
      finalAnswer: finalAnswer.trim(),
      totalDurationMs: now - startedAtRef.current,
    });
  }

  return (
    <div className="flex flex-col gap-4" data-testid="math-input">
      <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center">
        <p className="math text-3xl font-black tracking-tight text-white">{problem} = ?</p>
      </div>

      {steps.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tu desarrollo</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                inputMode="decimal"
                autoComplete="off"
                aria-label={`Paso ${i + 1}`}
                value={step.value}
                disabled={submitting}
                onFocus={() => setActive({ kind: 'step', index: i })}
                onChange={(e) => {
                  const next = e.target.value;
                  setSteps((rows) => rows.map((r, idx) => (idx === i ? { ...r, value: next } : r)));
                }}
                className={FIELD}
                placeholder={`Paso ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                aria-label={`Eliminar paso ${i + 1}`}
                disabled={submitting}
                className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="final-answer">
          Respuesta final
        </label>
        <input
          id="final-answer"
          inputMode="decimal"
          autoComplete="off"
          value={finalAnswer}
          disabled={submitting}
          onFocus={() => setActive({ kind: 'final' })}
          onChange={(e) => setFinalAnswer(e.target.value)}
          className={FIELD}
          placeholder="Escribe tu resultado"
        />
      </div>

      <MathKeypad onChar={onChar} onBackspace={onBackspace} onClear={onClear} disabled={submitting} />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={addStep}
          disabled={submitting}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          + Mostrar mi desarrollo
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 rounded-xl bg-sky-500 px-5 py-3 text-base font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Revisando…' : submitLabel}
        </button>
      </div>
    </div>
  );
}
