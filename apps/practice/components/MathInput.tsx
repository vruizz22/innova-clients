'use client';

import { useState, type FormEvent } from 'react';

export interface StepInput {
  value: string;
  stepIndex: number;
}

interface MathInputProps {
  stepCount?: number;
  stepLabels?: string[];
  expectedAnswer?: number;
  onSubmit: (steps: StepInput[], finalAnswer: string) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export function MathInput({
  stepCount = 3,
  stepLabels,
  onSubmit,
  loading = false,
  disabled = false,
}: MathInputProps): JSX.Element {
  const [steps, setSteps] = useState<string[]>(Array.from({ length: stepCount }, () => ''));

  function updateStep(index: number, value: string): void {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const stepsPayload: StepInput[] = steps.map((value, stepIndex) => ({ value, stepIndex }));
    const finalAnswer = steps[steps.length - 1] ?? '';
    await onSubmit(stepsPayload, finalAnswer);
  }

  return (
    <form onSubmit={handleSubmit} className="math-form">
      {Array.from({ length: stepCount }, (_, i) => (
        <div key={i} className="step-field">
          <label className="step-label" htmlFor={`step-input-${i}`}>
            {stepLabels?.[i] ?? `Paso ${i + 1}`}
            {i === stepCount - 1 ? ' (respuesta final)' : ''}
          </label>
          <input
            id={`step-input-${i}`}
            type="number"
            inputMode="numeric"
            value={steps[i]}
            onChange={(e) => updateStep(i, e.target.value)}
            disabled={disabled || loading}
            required={i === stepCount - 1}
            className="step-input"
            placeholder="0"
            data-testid={`step-input-${i}`}
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={disabled || loading}
        className="btn btn-primary btn-submit-full"
      >
        {loading ? 'Enviando...' : 'Verificar respuesta'}
      </button>
    </form>
  );
}
