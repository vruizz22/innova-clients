'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SolveAdhocInput } from '@innova/api-client';
import { CameraIcon, Dropzone, LoaderIcon, MathField } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import { FeedbackPanel, type FeedbackResult } from './FeedbackPanel';

export interface SolveExerciseProps {
  readonly studentId: string;
  readonly exerciseId: string;
  readonly problem: string;
  readonly skill: string;
  readonly difficultyLabel: string;
}

const POLL_TRIES = 36;
const POLL_DELAY_MS = 5000;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function pollAttemptClassification(attemptId: string): Promise<FeedbackResult | null> {
  const api = getBrowserApi();
  for (let i = 0; i < POLL_TRIES; i += 1) {
    await sleep(POLL_DELAY_MS);
    const res = await api.getAttemptStatus(attemptId);
    if (!res.ok) continue;
    const s = res.data;
    if (s.status === 'CLASSIFIED' && s.errorTagCode && s.errorTagCode !== 'UNCLASSIFIED') {
      return {
        attemptId: s.attemptId,
        isCorrect: s.isCorrect,
        errorTagCode: s.errorTagCode,
        errorTagName: s.errorTagName,
      };
    }
  }
  return null;
}

type Phase =
  | { readonly kind: 'review' }
  | { readonly kind: 'extracting' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'analyzing'; readonly result: FeedbackResult }
  | { readonly kind: 'feedback'; readonly result: FeedbackResult }
  | { readonly kind: 'error'; readonly message: string };

const FIELD =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20';
const MATH_BOX =
  'rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 transition-colors focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20';
const MATH_FIELD = 'block min-h-[2.25rem] w-full border-0 bg-transparent text-base outline-none';

export function SolveExercise(props: SolveExerciseProps): JSX.Element {
  const router = useRouter();
  const [work, setWork] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [phase, setPhase] = useState<Phase>({ kind: 'review' });

  const canSubmit = phase.kind === 'review' && finalAnswer.trim().length > 0;

  const runPoll = useCallback(async (attemptId: string, base: FeedbackResult): Promise<void> => {
    setPhase({ kind: 'analyzing', result: base });
    const resolved = await pollAttemptClassification(attemptId);
    setPhase({ kind: 'feedback', result: resolved ?? base });
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!canSubmit) return;
    setPhase({ kind: 'submitting' });
    const workLines = work.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const payload: SolveAdhocInput = {
      studentId: props.studentId,
      problemLatex: props.problem,
      studentSteps: workLines,
      studentFinalAnswer: finalAnswer.trim(),
    };
    const res = await getBrowserApi().solveAdhoc(payload);
    if (!res.ok) {
      setPhase({
        kind: 'error',
        message:
          res.error.kind === 'http' && res.error.status === 401
            ? 'Tu sesión expiró. Vuelve a entrar para enviar tu respuesta.'
            : 'No pudimos enviar tu respuesta. Revisa tu conexión e intenta de nuevo.',
      });
      return;
    }
    const base: FeedbackResult = {
      attemptId: res.data.attemptId,
      isCorrect: false,
      errorTagCode: 'UNCLASSIFIED',
    };
    await runPoll(res.data.attemptId, base);
  }, [canSubmit, work, finalAnswer, props, runPoll]);

  const handlePhoto = useCallback(async (file: File): Promise<void> => {
    setPhase({ kind: 'extracting' });
    const res = await getBrowserApi().ocrExtract(file);
    if (!res.ok || res.data.exercises.length === 0) {
      setPhase({ kind: 'review' });
      return;
    }
    const ex = res.data.exercises[0]!;
    const workLines = ex.rawSteps.filter((s) => !s.isFinal).map((s) => s.expression);
    setWork(workLines.join('\n'));
    setFinalAnswer(ex.finalAnswer);
    setPhase({ kind: 'review' });
  }, []);

  const reset = useCallback((): void => {
    setWork('');
    setFinalAnswer('');
    setPhase({ kind: 'review' });
  }, []);

  if (phase.kind === 'analyzing') {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--warning-bg)] px-5 py-6 text-center">
        <LoaderIcon size={36} className="mx-auto animate-spin text-[var(--warning-fg)]" />
        <p className="mt-2 text-lg font-black text-[var(--warning-fg)]">Revisando tu desarrollo…</p>
        <p className="mt-1 text-sm text-[var(--warning-fg)]/80">
          Estamos analizando paso a paso en qué te equivocaste. Esto puede tardar un momento.
        </p>
      </div>
    );
  }

  if (phase.kind === 'feedback') {
    const isPending = phase.result.errorTagCode === 'UNCLASSIFIED';
    const onRetryFn = isPending
      ? () => void runPoll(phase.result.attemptId, phase.result)
      : reset;
    return (
      <FeedbackPanel
        result={phase.result}
        onNext={() => { router.push('/practice'); router.refresh(); }}
        nextLabel="← Volver a mi práctica"
        onRetry={onRetryFn}
        retryLabel={isPending ? 'Reintentar análisis' : 'Intentar de nuevo'}
      />
    );
  }

  const isExtracting = phase.kind === 'extracting';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
          {props.skill} · {props.difficultyLabel}
        </p>
        <p className="math mt-2 text-2xl font-black text-[var(--fg-1)]">{props.problem} = ?</p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
          Tu desarrollo (una línea por paso)
        </span>
        <textarea
          className={`${FIELD} resize-none font-mono`}
          rows={3}
          value={work}
          disabled={phase.kind === 'submitting' || isExtracting}
          onChange={(e) => setWork(e.target.value)}
          placeholder={'Ej:\n345 − 178\n= 167'}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
          Respuesta final
        </span>
        <div className={MATH_BOX}>
          <MathField
            value={finalAnswer}
            onChange={setFinalAnswer}
            readOnly={phase.kind === 'submitting' || isExtracting}
            ariaLabel="Respuesta final"
            placeholder="Tu resultado"
            className={MATH_FIELD}
          />
        </div>
      </label>

      <Dropzone
        accept="image/*"
        capture="environment"
        disabled={phase.kind === 'submitting' || isExtracting}
        onFiles={(files) => { if (files[0]) void handlePhoto(files[0]); }}
        className="!py-4"
      >
        {isExtracting ? (
          <>
            <LoaderIcon size={20} className="animate-spin text-[var(--primary)]" />
            <span className="text-sm text-[var(--fg-2)]">Leyendo tu hoja…</span>
          </>
        ) : (
          <>
            <CameraIcon size={20} className="text-[var(--fg-3)]" />
            <span className="text-sm font-semibold text-[var(--fg-1)]">Escanear mi desarrollo</span>
            <span className="text-xs text-[var(--fg-3)]">Foto de tu hoja · OCR llena el formulario</span>
          </>
        )}
      </Dropzone>

      {phase.kind === 'error' ? (
        <p className="rounded-xl bg-[var(--error-bg)] px-4 py-3 text-sm font-medium text-[var(--error-fg)]">
          {phase.message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!canSubmit}
        className="rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-[var(--primary-fg)] transition-all hover:bg-[var(--primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {phase.kind === 'submitting' ? 'Revisando…' : 'Enviar respuesta'}
      </button>
    </div>
  );
}
