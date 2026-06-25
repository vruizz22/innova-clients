'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AttemptResult, OcrExercise, SolveAdhocInput } from '@innova/api-client';
import { CameraIcon, Dropzone, ImageLightbox, LoaderIcon, MathField } from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import { problemFromExpression } from '@/lib/arithmetic';
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
  readonly topicHint: string | null;
  readonly confidence: number;
}

function draftFromOcr(ex: OcrExercise): ReviewDraft {
  const workLines = ex.rawSteps.filter((s) => !s.isFinal).map((s) => s.expression);
  const problem = ex.problem.trim()
    ? problemFromExpression(ex.problem)
    : problemFromExpression(workLines[0] ?? ex.rawSteps[0]?.expression ?? '');
  return {
    problem,
    work: workLines.join('\n'),
    finalAnswer: ex.finalAnswer,
    topicHint: ex.topicHint,
    confidence: ex.confidence,
  };
}

// The POST result lacks the es-CL catalog name; the poll status carries it, so we
// keep it on the result FeedbackPanel renders.
interface ClassifiedResult extends AttemptResult {
  readonly errorTagName?: string | null;
}

type ItemPhase =
  | { readonly kind: 'review' }
  | { readonly kind: 'submitting' }
  // Escalated to the async LLM classifier — polling for the real error tag.
  | { readonly kind: 'analyzing'; readonly result: ClassifiedResult }
  | { readonly kind: 'feedback'; readonly result: ClassifiedResult }
  | { readonly kind: 'error'; readonly message: string };

// Poll the attempt after submit, mirroring how guides poll getSubmissionStatus:
// a RULE classification comes back synchronously, but an UNCLASSIFIED answer is
// finished by the async LLM worker (Haiku batch, minutes — not seconds), so we
// wait up to the same ~180s window as the guide flow before settling. On timeout
// the result stays UNCLASSIFIED and the UI shows a calm "pendiente", never a
// "Sin clasificar" error.
const POLL_TRIES = 36;
const POLL_DELAY_MS = 5000;
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function pollAttemptClassification(attemptId: string): Promise<ClassifiedResult | null> {
  const api = getBrowserApi();
  for (let i = 0; i < POLL_TRIES; i += 1) {
    await sleep(POLL_DELAY_MS);
    const res = await api.getAttemptStatus(attemptId);
    if (!res.ok) continue;
    const status = res.data;
    if (status.status === 'CLASSIFIED' && status.errorTagCode && status.errorTagCode !== 'UNCLASSIFIED') {
      return {
        attemptId: status.attemptId,
        isCorrect: status.isCorrect,
        errorTagCode: status.errorTagCode,
        errorTagName: status.errorTagName,
        classifierSource: 'LLM',
        confidence: status.confidence ?? 0,
      };
    }
  }
  return null;
}

/** Sentinel used while the async classifier is still working on an attempt. */
function pendingResult(attemptId: string): ClassifiedResult {
  return {
    attemptId,
    isCorrect: false,
    errorTagCode: 'UNCLASSIFIED',
    classifierSource: 'LLM',
    confidence: 0,
  };
}

interface ItemState {
  readonly draft: ReviewDraft;
  readonly phase: ItemPhase;
}

type Phase =
  | { readonly kind: 'idle' }
  | { readonly kind: 'extracting' }
  // Adding another photo to an existing session without resetting.
  | { readonly kind: 'adding'; readonly items: readonly ItemState[]; readonly photoUrls: readonly string[] }
  | {
      readonly kind: 'ready';
      readonly items: readonly ItemState[];
      readonly photoUrls: readonly string[];
    }
  | { readonly kind: 'error'; readonly message: string };

const SCAN_SESSION_KEY = 'innova_scan_session_v1';
const SCAN_HISTORY_KEY = 'innova_scan_history_v1';
const MAX_HISTORY = 30;

interface SavedItem {
  draft: ReviewDraft;
  /** 'analyzing' is serialised as feedback+UNCLASSIFIED so on restore the user sees the pending state with retry. */
  phaseKind: 'review' | 'feedback' | 'analyzing' | 'error';
  feedbackResult?: ClassifiedResult;
  errorMessage?: string;
}

export interface ScanHistoryExercise {
  problem: string;
  work: string;
  finalAnswer: string;
  topicHint: string | null;
  confidence: number;
  isCorrect: boolean;
  errorTagCode: string | null;
  errorTagName: string | null | undefined;
  attemptId: string;
}

export interface ScanHistoryEntry {
  id: string;
  date: string;
  total: number;
  correct: number;
  topics: string[];
  exercises: ScanHistoryExercise[];
}

/** Upsert a session entry in history — same sessionId updates in place, new id prepends. */
function upsertHistory(sessionId: string, items: readonly ItemState[]): void {
  const done = items.flatMap((it) =>
    it.phase.kind === 'feedback'
      ? [{ draft: it.draft, result: it.phase.result }]
      : []
  );
  if (done.length === 0) return;
  const entry: ScanHistoryEntry = {
    id: sessionId,
    date: new Date().toISOString(),
    total: done.length,
    correct: done.filter((d) => d.result.isCorrect).length,
    topics: [
      ...new Set(
        done
          .map((d) => d.draft.topicHint)
          .filter((t): t is string => t !== null && t !== undefined)
      ),
    ],
    exercises: done.map((d) => ({
      problem: d.draft.problem,
      work: d.draft.work,
      finalAnswer: d.draft.finalAnswer,
      topicHint: d.draft.topicHint,
      confidence: d.draft.confidence,
      isCorrect: d.result.isCorrect,
      errorTagCode: d.result.errorTagCode ?? null,
      errorTagName: d.result.errorTagName,
      attemptId: d.result.attemptId,
    })),
  };
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    const history: ScanHistoryEntry[] = raw
      ? (JSON.parse(raw) as ScanHistoryEntry[])
      : [];
    const idx = history.findIndex((h) => h.id === sessionId);
    if (idx >= 0) {
      history[idx] = entry;
    } else {
      history.unshift(entry);
      if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    }
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
  } catch { /* storage full or unavailable */ }
}

// `/scan` mirrors the guide's per-exercise scan: one photo can hold several
// exercises, so the OCR returns an array and we render a reviewable card per
// exercise, each submitted independently (same review → confirm → feedback loop).
export function ScanFlow({ studentId }: ScanFlowProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Restore scan session on mount so a reload doesn't erase in-progress work.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCAN_SESSION_KEY);
      if (!raw) return;
      const saved: SavedItem[] = JSON.parse(raw) as SavedItem[];
      if (!Array.isArray(saved) || saved.length === 0) return;
      const items: ItemState[] = saved.map((s) => ({
        draft: s.draft,
        phase:
          (s.phaseKind === 'feedback' || s.phaseKind === 'analyzing') && s.feedbackResult
            ? ({ kind: 'feedback', result: s.feedbackResult } as const)
            : s.phaseKind === 'error' && s.errorMessage
            ? ({ kind: 'error', message: s.errorMessage } as const)
            : ({ kind: 'review' } as const),
      }));
      setPhase({ kind: 'ready', items, photoUrls: [] });
    } catch { /* corrupted or unavailable */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist drafts and results whenever items change (photos can't be serialised).
  useEffect(() => {
    if (phase.kind !== 'ready' && phase.kind !== 'adding') return;
    const toSave: SavedItem[] = phase.items.map((it) => ({
      draft: it.draft,
      phaseKind:
        it.phase.kind === 'feedback' ? 'feedback'
        : it.phase.kind === 'analyzing' ? 'analyzing'
        : it.phase.kind === 'error' ? 'error'
        : 'review',
      ...(it.phase.kind === 'feedback' ? { feedbackResult: it.phase.result } : {}),
      ...(it.phase.kind === 'analyzing' ? { feedbackResult: it.phase.result } : {}),
      ...(it.phase.kind === 'error' ? { errorMessage: it.phase.message } : {}),
    }));
    try { localStorage.setItem(SCAN_SESSION_KEY, JSON.stringify(toSave)); } catch { /* full */ }
    // Upsert history entry whenever any item completes — survives navigation away.
    const hasAnyFeedback = phase.items.some((it) => it.phase.kind === 'feedback');
    if (hasAnyFeedback) upsertHistory(sessionIdRef.current, phase.items);
  }, [phase]);

  const onPickImage = useCallback(async (file: File): Promise<void> => {
    setPhase((p) => {
      if (p.kind === 'ready') for (const u of p.photoUrls) URL.revokeObjectURL(u);
      return { kind: 'extracting' };
    });
    const res = await getBrowserApi().ocrExtract(file);
    if (!res.ok) {
      setPhase({
        kind: 'error',
        message:
          res.error.kind === 'http' && res.error.status === 401
            ? 'Tu sesión expiró. Vuelve a entrar para escanear.'
            : 'No pudimos leer la foto. Asegúrate de que se vea clara e intenta de nuevo.',
      });
      return;
    }
    if (res.data.exercises.length === 0) {
      setPhase({
        kind: 'error',
        message: 'No detectamos ejercicios en la foto. Prueba con mejor luz y la hoja completa.',
      });
      return;
    }
    setPhase({
      kind: 'ready',
      photoUrls: [URL.createObjectURL(file)],
      items: res.data.exercises.map((ex) => ({
        draft: draftFromOcr(ex),
        phase: { kind: 'review' as const },
      })),
    });
  }, []);

  // Append exercises from a second (or Nth) photo without resetting the session.
  const appendPage = useCallback(async (file: File): Promise<void> => {
    if (phase.kind !== 'ready') return;
    const { items: prevItems, photoUrls: prevUrls } = phase;
    setPhase({ kind: 'adding', items: prevItems, photoUrls: prevUrls });
    const res = await getBrowserApi().ocrExtract(file);
    if (!res.ok || res.data.exercises.length === 0) {
      setPhase({ kind: 'ready', items: prevItems, photoUrls: prevUrls });
      return;
    }
    const newUrl = URL.createObjectURL(file);
    setPhase({
      kind: 'ready',
      photoUrls: [...prevUrls, newUrl],
      items: [
        ...prevItems,
        ...res.data.exercises.map((ex) => ({
          draft: draftFromOcr(ex),
          phase: { kind: 'review' as const },
        })),
      ],
    });
  }, [phase]);

  const patchItem = useCallback((idx: number, partial: Partial<ItemState>): void => {
    setPhase((p) =>
      p.kind === 'ready'
        ? { ...p, items: p.items.map((it, i) => (i === idx ? { ...it, ...partial } : it)) }
        : p
    );
  }, []);

  // Show the "analizando" state, then poll until the async classifier settles;
  // on timeout we keep `base` (UNCLASSIFIED) so FeedbackPanel renders "pendiente".
  // Reused by submit, solve-adhoc and the manual "reintentar análisis".
  const runPoll = useCallback(
    async (idx: number, attemptId: string, base: ClassifiedResult): Promise<void> => {
      patchItem(idx, { phase: { kind: 'analyzing', result: base } });
      const resolved = await pollAttemptClassification(attemptId);
      patchItem(idx, { phase: { kind: 'feedback', result: resolved ?? base } });
    },
    [patchItem]
  );

  const solveAdhocItem = useCallback(
    async (idx: number, adhocPayload: SolveAdhocInput): Promise<void> => {
      patchItem(idx, { phase: { kind: 'submitting' } });
      const res = await getBrowserApi().solveAdhoc(adhocPayload);
      if (!res.ok) {
        patchItem(idx, {
          phase: {
            kind: 'error',
            message: 'No pudimos analizar tu ejercicio. Revisa tu conexión e intenta de nuevo.',
          },
        });
        return;
      }
      await runPoll(idx, res.data.attemptId, pendingResult(res.data.attemptId));
    },
    [patchItem, runPoll]
  );

  const reset = useCallback((): void => {
    setLightboxSrc(null);
    try { localStorage.removeItem(SCAN_SESSION_KEY); } catch { /* ignore */ }
    sessionIdRef.current = crypto.randomUUID();
    setPhase((p) => {
      if (p.kind === 'ready' || p.kind === 'adding') {
        for (const u of p.photoUrls) URL.revokeObjectURL(u);
      }
      return { kind: 'idle' };
    });
  }, []);

  if (phase.kind === 'ready' || phase.kind === 'adding') {
    const isAdding = phase.kind === 'adding';
    const total = phase.items.length;
    const graded = phase.items.filter((it) => it.phase.kind === 'feedback').length;
    const pageCount = phase.photoUrls.length;
    return (
      <div className="flex flex-col gap-5">
        {/* Header: stats + photo thumbnails */}
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm text-ink-muted">
            <span className="font-bold text-ink">{total}</span>{' '}
            {total === 1 ? 'ejercicio' : 'ejercicios'}
            {pageCount > 1 ? ` · ${pageCount} hojas` : ''}
            {graded > 0 ? ` · ${graded} enviado${graded === 1 ? '' : 's'}` : ''}
          </p>
          {/* Thumbnails — one per photo, click to expand */}
          <div className="flex shrink-0 gap-1.5 overflow-x-auto">
            {phase.photoUrls.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightboxSrc(url)}
                aria-label={`Ver hoja ${i + 1} en grande`}
                className="overflow-hidden rounded-lg border border-line transition-transform hover:scale-105 active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Hoja ${i + 1}`} className="h-12 w-12 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {isAdding ? (
          <div className="flex items-center gap-3 rounded-xl bg-[var(--info-bg)] px-4 py-3">
            <LoaderIcon size={18} className="shrink-0 animate-spin text-[var(--primary)]" />
            <p className="text-sm font-medium text-[var(--primary)]">Leyendo hoja adicional…</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {phase.items.map((item, idx) => (
            <ExerciseCard
              key={idx}
              index={idx}
              item={item}
              studentId={studentId}
              onChange={(draft) => patchItem(idx, { draft })}
              onSolveAdhoc={(payload) => void solveAdhocItem(idx, payload)}
              onRetryPoll={(attemptId) => void runPoll(idx, attemptId, pendingResult(attemptId))}
              onEdit={() => patchItem(idx, { phase: { kind: 'review' } })}
            />
          ))}
        </div>

        {/* Add another page without resetting */}
        {!isAdding ? (
          <Dropzone
            accept="image/*"
            capture="environment"
            onFiles={(files) => { if (files[0]) void appendPage(files[0]); }}
            className="!py-6"
          >
            <CameraIcon size={24} className="text-ink-subtle" />
            <span className="text-sm font-semibold text-ink">Agregar otra hoja</span>
            <span className="text-xs text-ink-muted">Sube la siguiente página de la misma guía</span>
          </Dropzone>
        ) : null}

        <button
          type="button"
          onClick={reset}
          disabled={isAdding}
          className="self-start text-xs font-medium text-ink-subtle transition-colors hover:text-ink disabled:pointer-events-none"
        >
          Empezar de nuevo
        </button>

        <ImageLightbox
          open={lightboxSrc !== null}
          src={lightboxSrc}
          alt="Tu foto escaneada"
          onClose={() => setLightboxSrc(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Dropzone
        accept="image/*"
        capture="environment"
        disabled={phase.kind === 'extracting'}
        onFiles={(files) => {
          if (files[0]) void onPickImage(files[0]);
        }}
        className="!py-12"
      >
        <CameraIcon size={48} className="text-ink-subtle" />
        <span className="text-base font-bold text-ink">
          {phase.kind === 'extracting'
            ? 'Leyendo tu hoja…'
            : 'Fotografía tu guía resuelta'}
        </span>
        <span className="text-sm text-ink-muted">
          {phase.kind === 'extracting'
            ? 'Detectando ejercicios…'
            : 'Sube una foto por hoja — puedes agregar más páginas después.'}
        </span>
      </Dropzone>

      {phase.kind === 'error' ? (
        <p
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: 'var(--error-bg)', color: 'var(--error-fg)' }}
        >
          {phase.message}
        </p>
      ) : null}
    </div>
  );
}

interface ExerciseCardProps {
  readonly index: number;
  readonly item: ItemState;
  readonly studentId: string;
  readonly onChange: (draft: ReviewDraft) => void;
  readonly onSolveAdhoc: (payload: SolveAdhocInput) => void;
  readonly onRetryPoll: (attemptId: string) => void;
  readonly onEdit: () => void;
}

const FIELD =
  'w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-[var(--primary)]/20';

// Box around a WYSIWYG MathField — mirrors FIELD's border/focus on the host.
const MATH_BOX =
  'rounded-xl border border-line bg-surface px-3 py-1.5 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-[var(--primary)]/20';
const MATH_FIELD = 'block min-h-[2.25rem] w-full border-0 bg-transparent text-base outline-none';

function ExerciseCard({
  index,
  item,
  studentId,
  onChange,
  onSolveAdhoc,
  onRetryPoll,
  onEdit,
}: ExerciseCardProps): JSX.Element {
  const { draft, phase } = item;

  const submitting = phase.kind === 'submitting';
  const canSubmit =
    !submitting &&
    draft.problem.trim().length > 0 &&
    draft.finalAnswer.trim().length > 0;

  function handleSubmit(): void {
    if (!canSubmit) return;
    const workLines = draft.work
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    onSolveAdhoc({
      studentId,
      problemLatex: draft.problem,
      studentSteps: workLines,
      studentFinalAnswer: draft.finalAnswer.trim(),
    });
  }

  const header = (
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-subtle">
        Ejercicio {index + 1}
      </p>
      <span className="math text-xs text-ink-subtle">
        Confianza {Math.round(draft.confidence * 100)}%
        {draft.topicHint ? ` · ${draft.topicHint}` : ''}
      </span>
    </div>
  );

  if (phase.kind === 'analyzing') {
    return (
      <div className="sp-rise rounded-2xl border border-line bg-surface p-4">
        {header}
        <div className="flex items-center gap-3 rounded-xl bg-[var(--warning-bg)] px-4 py-4">
          <LoaderIcon size={20} className="animate-spin text-[var(--warning-fg)]" />
          <div>
            <p className="text-sm font-bold text-[var(--warning-fg)]">Analizando tu desarrollo…</p>
            <p className="text-xs text-[var(--warning-fg)]/80">
              Estamos revisando paso a paso en qué te equivocaste.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase.kind === 'feedback') {
    const isPending = phase.result.errorTagCode === 'UNCLASSIFIED';
    const attemptId = phase.result.attemptId;
    return (
      <div className="sp-rise rounded-2xl border border-line bg-surface p-4">
        {header}
        <FeedbackPanel
          result={phase.result}
          onNext={onEdit}
          nextLabel="Editar y reenviar"
          {...(isPending
            ? { onRetry: () => onRetryPoll(attemptId), retryLabel: 'Reintentar análisis' }
            : {})}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      {header}
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Problema
          </span>
          <div className={MATH_BOX}>
            <MathField
              value={draft.problem}
              onChange={(v) => onChange({ ...draft, problem: v })}
              readOnly={submitting}
              ariaLabel={`Problema del ejercicio ${index + 1}`}
              placeholder="Ej: 345 - 178"
              className={MATH_FIELD}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Tu desarrollo (una línea por paso)
          </span>
          <textarea
            className={`${FIELD} resize-none font-mono`}
            rows={3}
            value={draft.work}
            disabled={submitting}
            onChange={(e) => onChange({ ...draft, work: e.target.value })}
            placeholder={'Ej:\n345 − 178\n= 167'}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Respuesta final
          </span>
          <div className={MATH_BOX}>
            <MathField
              value={draft.finalAnswer}
              onChange={(v) => onChange({ ...draft, finalAnswer: v })}
              readOnly={submitting}
              ariaLabel={`Respuesta final del ejercicio ${index + 1}`}
              placeholder="Tu resultado"
              className={MATH_FIELD}
            />
          </div>
        </label>


        {phase.kind === 'error' ? (
          <p
            className="rounded-xl px-3 py-2 text-sm font-medium"
            style={{ background: 'var(--error-bg)', color: 'var(--error-fg)' }}
          >
            {phase.message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-xl bg-brand px-5 py-3 text-base font-bold text-brand-fg transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Revisando…' : 'Enviar para revisión'}
        </button>
      </div>
    </div>
  );
}
