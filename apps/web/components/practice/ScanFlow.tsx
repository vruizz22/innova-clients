'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AttemptResult, CreateAttemptInput, OcrExtractResult } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { evalArithmetic, problemFromExpression } from '@/lib/arithmetic';
import { FeedbackPanel } from './FeedbackPanel';

export interface ScanFlowProps {
  /** Student.id (profileId) — the studentId POST /attempts expects. */
  readonly studentId: string;
}

interface ReviewDraft {
  readonly problem: string;
  readonly work: string;
  readonly finalAnswer: string;
  /** Manual override when the problem can't be auto-evaluated. */
  readonly manualExpected: string;
  readonly topicHint: string | null;
  readonly confidence: number;
}

type Phase =
  | { readonly kind: 'idle' }
  | { readonly kind: 'extracting' }
  | { readonly kind: 'review'; readonly draft: ReviewDraft }
  | { readonly kind: 'submitting'; readonly draft: ReviewDraft }
  | { readonly kind: 'feedback'; readonly result: AttemptResult }
  | { readonly kind: 'error'; readonly message: string };

function draftFromOcr(ocr: OcrExtractResult): ReviewDraft {
  const workLines = ocr.rawSteps.filter((s) => !s.isFinal).map((s) => s.expression);
  const problem = problemFromExpression(workLines[0] ?? ocr.rawSteps[0]?.expression ?? '');
  return {
    problem,
    work: workLines.join('\n'),
    finalAnswer: ocr.finalAnswer,
    manualExpected: '',
    topicHint: ocr.topicHint,
    confidence: ocr.confidence,
  };
}

export function ScanFlow({ studentId }: ScanFlowProps): JSX.Element {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = useCallback(async (file: File): Promise<void> => {
    setPhase({ kind: 'extracting' });
    const api = getBrowserApi();
    const res = await api.ocrExtract(file);
    if (res.ok) {
      setPhase({ kind: 'review', draft: draftFromOcr(res.data) });
    } else {
      setPhase({
        kind: 'error',
        message:
          res.error.kind === 'http' && res.error.status === 401
            ? 'Tu sesión expiró. Vuelve a entrar para escanear.'
            : 'No pudimos leer la foto. Asegúrate de que se vea clara e intenta de nuevo.',
      });
    }
  }, []);

  if (phase.kind === 'feedback') {
    return (
      <FeedbackPanel
        result={phase.result}
        onNext={() => {
          router.push('/practice');
          router.refresh();
        }}
        nextLabel="Volver a mi práctica →"
        onRetry={() => setPhase({ kind: 'idle' })}
        retryLabel="Escanear otra"
      />
    );
  }

  if (phase.kind === 'review' || phase.kind === 'submitting') {
    return (
      <ScanReview
        draft={phase.draft}
        submitting={phase.kind === 'submitting'}
        onChange={(draft) => setPhase({ kind: 'review', draft })}
        onCancel={() => setPhase({ kind: 'idle' })}
        onSubmit={async (payload) => {
          setPhase({ kind: 'submitting', draft: phase.draft });
          const api = getBrowserApi();
          const res = await api.createAttempt(payload);
          if (res.ok) {
            setPhase({ kind: 'feedback', result: res.data });
          } else {
            setPhase({
              kind: 'error',
              message: 'No pudimos enviar tu respuesta. Revisa tu conexión e intenta de nuevo.',
            });
          }
        }}
        studentId={studentId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onPickImage(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={phase.kind === 'extracting'}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center hover:border-sky-300 disabled:opacity-60"
      >
        <span className="text-5xl">📷</span>
        <span className="text-base font-bold text-slate-800">
          {phase.kind === 'extracting' ? 'Leyendo tu hoja…' : 'Toma o sube una foto'}
        </span>
        <span className="text-sm text-slate-500">
          Fotografía tu cuaderno con el ejercicio resuelto. Lo leeremos y te daremos feedback.
        </span>
      </button>

      {phase.kind === 'error' ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {phase.message}
        </p>
      ) : null}
    </div>
  );
}

interface ScanReviewProps {
  readonly draft: ReviewDraft;
  readonly submitting: boolean;
  readonly studentId: string;
  readonly onChange: (draft: ReviewDraft) => void;
  readonly onCancel: () => void;
  readonly onSubmit: (payload: CreateAttemptInput) => void;
}

const FIELD =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

function ScanReview({
  draft,
  submitting,
  studentId,
  onChange,
  onCancel,
  onSubmit,
}: ScanReviewProps): JSX.Element {
  const autoExpected = useMemo(() => evalArithmetic(draft.problem), [draft.problem]);
  const needsManual = autoExpected === null;

  const studentAnswer = Number(draft.finalAnswer.trim().replace(',', '.'));
  const manualExpected = Number(draft.manualExpected.trim().replace(',', '.'));
  const expected = needsManual ? manualExpected : autoExpected;

  const canSubmit =
    !submitting &&
    draft.problem.trim().length > 0 &&
    Number.isFinite(studentAnswer) &&
    expected !== null &&
    Number.isFinite(expected);

  function handleSubmit(): void {
    if (!canSubmit || expected === null) return;
    const workLines = draft.work
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const rawSteps = [
      ...workLines.map((expression) => ({ expression, isFinal: false })),
      { expression: draft.finalAnswer.trim(), isFinal: true },
    ];
    onSubmit({
      studentId,
      topicCode: draft.topicHint ?? 'UNKNOWN',
      rawSteps,
      expectedAnswer: expected,
      studentAnswer,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
        Revisa lo que leímos de tu foto y corrige si algo quedó mal antes de enviar.
        <span className="mt-1 block text-xs text-sky-600">
          Confianza de lectura: {Math.round(draft.confidence * 100)}%
          {draft.topicHint ? ` · Tema: ${draft.topicHint}` : ''}
        </span>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Problema</span>
        <input
          className={FIELD}
          value={draft.problem}
          disabled={submitting}
          onChange={(e) => onChange({ ...draft, problem: e.target.value })}
          placeholder="Ej: 345 − 178"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Tu desarrollo (una línea por paso)
        </span>
        <textarea
          className={`${FIELD} resize-none font-mono`}
          rows={4}
          value={draft.work}
          disabled={submitting}
          onChange={(e) => onChange({ ...draft, work: e.target.value })}
          placeholder={'Ej:\n345 − 178\n= 167'}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Respuesta final
        </span>
        <input
          className={FIELD}
          inputMode="decimal"
          value={draft.finalAnswer}
          disabled={submitting}
          onChange={(e) => onChange({ ...draft, finalAnswer: e.target.value })}
          placeholder="Tu resultado"
        />
      </label>

      {needsManual ? (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            Respuesta correcta (no pudimos calcularla del problema)
          </span>
          <input
            className={FIELD}
            inputMode="decimal"
            value={draft.manualExpected}
            disabled={submitting}
            onChange={(e) => onChange({ ...draft, manualExpected: e.target.value })}
            placeholder="¿Cuál es el resultado correcto?"
          />
        </label>
      ) : (
        <p className="text-xs text-slate-400">
          Respuesta correcta calculada: <span className="font-semibold text-slate-600">{autoExpected}</span>
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 rounded-xl bg-sky-500 px-5 py-3 text-base font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Revisando…' : 'Enviar para revisión'}
        </button>
      </div>
    </div>
  );
}
