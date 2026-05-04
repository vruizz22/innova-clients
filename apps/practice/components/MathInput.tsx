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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {Array.from({ length: stepCount }, (_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2937]">
            {stepLabels?.[i] ?? `Paso ${i + 1}`}
            {i === stepCount - 1 ? ' (respuesta final)' : ''}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={steps[i]}
            onChange={(e) => updateStep(i, e.target.value)}
            disabled={disabled || loading}
            required={i === stepCount - 1}
            className={[
              'w-full rounded-xl border px-4 py-3 text-lg font-bold text-center text-[#1F2937]',
              'border-[#CDD3DD] focus:border-[#3FA7D6] focus:ring-2 focus:ring-[#3FA7D6] focus:outline-none',
              'placeholder:text-[#A5ADBC] transition-colors',
              disabled || loading ? 'opacity-50 cursor-not-allowed bg-[#F7F8FA]' : 'bg-white',
            ]
              .filter(Boolean)
              .join(' ')}
            placeholder="0"
            data-testid={`step-input-${i}`}
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={disabled || loading}
        className={[
          'w-full py-3 rounded-xl font-semibold text-white transition-all text-base',
          'bg-[#3FA7D6] hover:bg-[#2F8DBA] active:bg-[#226E94]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FA7D6]',
          disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {loading ? 'Enviando...' : 'Verificar respuesta'}
      </button>
    </form>
  );
}
