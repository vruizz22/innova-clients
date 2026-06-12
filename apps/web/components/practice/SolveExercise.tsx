'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MathInput } from '@innova/math-input';
import type { MathInputResult } from '@innova/math-input';
import type { AttemptResult, CreateAttemptInput } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { FeedbackPanel } from './FeedbackPanel';

export interface SolveExerciseProps {
  /** Student.id (profileId) — the studentId POST /attempts expects. */
  readonly studentId: string;
  readonly exerciseId: string;
  readonly problem: string;
  readonly topicCode: string;
  readonly skill: string;
  readonly difficultyLabel: string;
  readonly expectedAnswer: number;
}

type Phase =
  | { readonly kind: 'solving' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'feedback'; readonly result: AttemptResult };

/**
 * Parses a clean binary subtraction "A − B" into its operands so the backend's
 * subtraction rule engine can use them. Returns undefined for anything else —
 * the DTO fields are optional, so omitting them is always safe.
 */
function parseSubtraction(problem: string): { minuend: number; subtrahend: number } | undefined {
  const match = problem.replace(/\s+/g, '').match(/^(\d+(?:\.\d+)?)[−-](\d+(?:\.\d+)?)$/);
  if (!match) return undefined;
  const minuend = Number(match[1]);
  const subtrahend = Number(match[2]);
  if (!Number.isFinite(minuend) || !Number.isFinite(subtrahend)) return undefined;
  return { minuend, subtrahend };
}

function buildPayload(props: SolveExerciseProps, result: MathInputResult): CreateAttemptInput | null {
  const studentAnswer = Number(result.finalAnswer);
  if (!Number.isFinite(studentAnswer)) return null;

  const rawSteps = [
    ...result.steps.map((s) => ({ expression: s.value, isFinal: false })),
    { expression: result.finalAnswer, isFinal: true },
  ];
  const operands = parseSubtraction(props.problem);

  return {
    studentId: props.studentId,
    topicCode: props.topicCode,
    exerciseId: props.exerciseId,
    rawSteps,
    expectedAnswer: props.expectedAnswer,
    studentAnswer,
    ...(operands ?? {}),
  };
}

export function SolveExercise(props: SolveExerciseProps): JSX.Element {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: 'solving' });

  const handleSubmit = useCallback(
    async (result: MathInputResult): Promise<void> => {
      const payload = buildPayload(props, result);
      if (payload === null) {
        setPhase({ kind: 'error', message: 'Escribe un número como respuesta final.' });
        return;
      }
      setPhase({ kind: 'submitting' });
      const api = getBrowserApi();
      const res = await api.createAttempt(payload);
      if (res.ok) {
        setPhase({ kind: 'feedback', result: res.data });
      } else {
        setPhase({
          kind: 'error',
          message:
            res.error.kind === 'http' && res.error.status === 401
              ? 'Tu sesión expiró. Vuelve a entrar para enviar tu respuesta.'
              : 'No pudimos enviar tu respuesta. Revisa tu conexión e intenta de nuevo.',
        });
      }
    },
    [props]
  );

  const reset = useCallback(() => setPhase({ kind: 'solving' }), []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {props.skill} · {props.difficultyLabel}
        </p>
      </div>

      {phase.kind === 'feedback' ? (
        <FeedbackPanel
          result={phase.result}
          onNext={() => {
            router.push('/practice');
            router.refresh();
          }}
          onRetry={reset}
        />
      ) : (
        <>
          <MathInput
            problem={props.problem}
            onSubmit={handleSubmit}
            submitting={phase.kind === 'submitting'}
          />
          {phase.kind === 'error' ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {phase.message}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
