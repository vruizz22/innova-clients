'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Quiz, QuizQuestion, SubmissionStatus } from '@innova/api-client';
import { formatHumanName } from '@innova/error-catalog';
import {
  CheckCircleIcon,
  XIcon,
  AlertTriangleIcon,
  LoaderIcon,
  CircleIcon,
  CameraIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  toast,
} from '@innova/ui';
import { getBrowserApi } from '@/lib/api.client';
import { MathText } from '@/components/latex/MathText';
import { MathPhotoUploader } from './MathPhotoUploader';

export interface QuizViewProps {
  readonly guideId: string;
  readonly quiz: Quiz;
}

type Status = SubmissionStatus | 'NONE';

interface SubState {
  submissionId: string | null;
  status: Status;
  score: number | null;
  isCorrect: boolean | null;
  errorTagCode: string | null;
  errorTagName: string | null;
  diagnosticHint: string | null;
  attemptNumber: number;
  /** When the submission entered an in-flight state, for the polling timeout. */
  startedAt: number | null;
}

const IN_FLIGHT: ReadonlySet<Status> = new Set<Status>(['UPLOADED', 'TRANSCRIBING', 'GRADING']);
// If grading doesn't settle within this window (e.g. the ai-engine consumer isn't
// running), stop the spinner and surface a retry instead of polling forever.
const GRADING_TIMEOUT_MS = 180_000;

function initialState(questions: readonly QuizQuestion[]): Record<string, SubState> {
  const out: Record<string, SubState> = {};
  for (const q of questions) {
    const latest = q.submissions[0]; // ordered attemptNumber desc
    out[q.id] = latest
      ? {
          submissionId: latest.id,
          status: latest.status,
          score: latest.score,
          isCorrect: latest.isCorrect,
          errorTagCode: null,
          errorTagName: null,
          diagnosticHint: null,
          attemptNumber: latest.attemptNumber,
          // Time the timeout from page load for a submission that's still in flight.
          startedAt: IN_FLIGHT.has(latest.status) ? Date.now() : null,
        }
      : {
          submissionId: null,
          status: 'NONE',
          score: null,
          isCorrect: null,
          errorTagCode: null,
          errorTagName: null,
          diagnosticHint: null,
          attemptNumber: 0,
          startedAt: null,
        };
  }
  return out;
}

function StatusGlyph({ s }: { s: SubState }): JSX.Element {
  if (s.status === 'NONE') return <CircleIcon size={16} className="text-[var(--fg-3)]" />;
  if (s.status === 'GRADED')
    return s.isCorrect ? (
      <CheckCircleIcon size={16} className="text-mint-500" />
    ) : (
      <XIcon size={16} className="text-danger" />
    );
  if (s.status === 'FAILED') return <AlertTriangleIcon size={16} className="text-[var(--warning-fg)]" />;
  return <LoaderIcon size={16} className="animate-spin text-[var(--primary)]" />;
}

export function QuizView({ guideId, quiz }: QuizViewProps): JSX.Element {
  const { questions } = quiz;
  const [subStates, setSubStates] = useState<Record<string, SubState>>(() =>
    initialState(questions)
  );
  const [filesByQ, setFilesByQ] = useState<Record<string, File[]>>({});
  const [selectedId, setSelectedId] = useState<string>(questions[0]?.id ?? '');
  const [uploading, setUploading] = useState<string | null>(null);
  // Whole-guide scan (additive): upload one photo per pending question at once.
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkPhotos, setBulkPhotos] = useState<File[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  // Mirror state in a ref so the polling interval reads fresh values.
  const stateRef = useRef(subStates);
  stateRef.current = subStates;

  const patch = useCallback((qid: string, partial: Partial<SubState>) => {
    setSubStates((m) => ({ ...m, [qid]: { ...m[qid], ...partial } as SubState }));
  }, []);

  // One interval polls every in-flight submission until it settles (non-blocking:
  // runs regardless of which question is on screen).
  const hasInFlight = useMemo(
    () => Object.values(subStates).some((s) => IN_FLIGHT.has(s.status)),
    [subStates]
  );
  useEffect(() => {
    if (!hasInFlight) return;
    const api = getBrowserApi();
    const id = setInterval(async () => {
      const entries = Object.entries(stateRef.current).filter(
        ([, s]) => s.submissionId && IN_FLIGHT.has(s.status)
      );
      for (const [qid, s] of entries) {
        if (!s.submissionId) continue;
        // Give up after the timeout so the UI never spins forever.
        if (s.startedAt && Date.now() - s.startedAt > GRADING_TIMEOUT_MS) {
          patch(qid, { status: 'FAILED', startedAt: null });
          continue;
        }
        const res = await api.getSubmissionStatus(s.submissionId);
        if (res.ok) {
          patch(qid, {
            status: res.data.status,
            score: res.data.score,
            isCorrect: res.data.isCorrect,
            errorTagCode: res.data.errorTagCode,
            errorTagName: res.data.errorTagName,
            diagnosticHint: res.data.diagnosticHint,
            ...(IN_FLIGHT.has(res.data.status) ? {} : { startedAt: null }),
          });
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [hasInFlight, patch]);

  // Enrich a graded selection with the error explanation (not in the quiz payload).
  useEffect(() => {
    const s = stateRef.current[selectedId];
    if (
      s &&
      s.submissionId &&
      s.status === 'GRADED' &&
      s.errorTagCode === null &&
      s.isCorrect === false
    ) {
      void getBrowserApi()
        .getSubmissionStatus(s.submissionId)
        .then((res) => {
          if (res.ok) {
            patch(selectedId, {
              errorTagCode: res.data.errorTagCode,
              errorTagName: res.data.errorTagName,
              diagnosticHint: res.data.diagnosticHint,
            });
          }
        });
    }
  }, [selectedId, patch]);

  // Core upload→grade for one question with an explicit file set. Reused by the
  // per-question submit and the whole-guide scan. Returns false on any failure.
  const submitFiles = useCallback(
    async (q: QuizQuestion, files: readonly File[]): Promise<boolean> => {
      if (files.length === 0) return false;
      const api = getBrowserApi();
      const created = await api.createSubmission(guideId, q.id, { photoCount: files.length });
      if (!created.ok) {
        patch(q.id, { status: 'FAILED' });
        return false;
      }
      const puts = await Promise.all(
        created.data.presignedPutUrls.map((url, i) =>
          fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'image/jpeg' },
            body: files[i],
          })
            .then((r) => r.ok)
            .catch(() => false)
        )
      );
      if (puts.some((ok) => !ok)) {
        patch(q.id, { status: 'FAILED' });
        return false;
      }
      const done = await api.completeSubmission(created.data.submissionId);
      if (!done.ok) {
        patch(q.id, { status: 'FAILED' });
        return false;
      }
      patch(q.id, {
        submissionId: created.data.submissionId,
        status: 'GRADING',
        attemptNumber: created.data.attemptNumber,
        isCorrect: null,
        score: null,
        errorTagCode: null,
        errorTagName: null,
        diagnosticHint: null,
        startedAt: Date.now(),
      });
      return true;
    },
    [guideId, patch]
  );

  const submit = useCallback(
    async (q: QuizQuestion): Promise<void> => {
      const files = filesByQ[q.id] ?? [];
      if (files.length === 0) return;
      setUploading(q.id);
      const ok = await submitFiles(q, files);
      setUploading(null);
      if (ok) setFilesByQ((m) => ({ ...m, [q.id]: [] }));
    },
    [filesByQ, submitFiles]
  );

  const questionCount = questions.length;

  const [bulkError, setBulkError] = useState<string | null>(null);

  const submitWholeGuide = useCallback(async (): Promise<void> => {
    const photos = bulkPhotos;
    if (photos.length === 0) return;
    const api = getBrowserApi();
    setBulkBusy(true);
    setBulkError(null);
    let totalMatched = 0;
    let uploadFailed = false;
    let limitReachedCount = 0;
    for (const photo of photos) {
      const urlRes = await api.getScanPageUploadUrl(guideId);
      if (!urlRes.ok) { uploadFailed = true; continue; }
      const put = await fetch(urlRes.data.presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': photo.type || 'image/jpeg' },
        body: photo,
      });
      if (!put.ok) { uploadFailed = true; continue; }
      const res = await api.processScanPage(guideId, urlRes.data.photoKey);
      if (!res.ok) continue;
      totalMatched += res.data.matched;
      limitReachedCount += res.data.submissions.filter(
        (s) => s.skipped && s.reason === 'limit_reached'
      ).length;
      for (const sub of res.data.submissions) {
        if (!sub.skipped && sub.submissionId) {
          patch(sub.questionId, {
            submissionId: sub.submissionId,
            status: 'GRADING',
            isCorrect: null,
            score: null,
            errorTagCode: null,
            errorTagName: null,
            diagnosticHint: null,
            startedAt: Date.now(),
          });
        }
      }
    }
    setBulkBusy(false);
    if (uploadFailed) {
      setBulkError('Error al subir una o más fotos. Intenta de nuevo.');
      return;
    }
    if (totalMatched === 0) {
      setBulkError(
        limitReachedCount > 0
          ? 'Alcanzaste el límite de intentos para esta guía.'
          : 'No pudimos procesar la foto en este momento. Intenta de nuevo.'
      );
      return;
    }
    setBulkPhotos([]);
    setBulkOpen(false);
    toast.success(
      `${totalMatched} ejercicio${totalMatched === 1 ? '' : 's'} detectado${totalMatched === 1 ? '' : 's'} y enviado${totalMatched === 1 ? '' : 's'} a corregir.`
    );
  }, [bulkPhotos, guideId, patch]);


  const selected = questions.find((q) => q.id === selectedId) ?? null;
  const sel = selected ? subStates[selected.id] : null;
  const canRetry =
    sel !== null &&
    (sel.status === 'GRADED' || sel.status === 'FAILED') &&
    sel.attemptNumber <= quiz.guide.maxResubmissions;

  return (
    <div className="mx-auto max-w-[1100px]" data-testid="quiz-root">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          <ArrowLeftIcon size={16} /> Mis guías
        </Link>
        <Link
          href={`/guides/${guideId}/results`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]"
        >
          Ver mi resumen <ChevronRightIcon size={16} />
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg-1)]">
        {quiz.guide.title}
      </h1>

      {questionCount > 1 ? (
        <div className="mt-4">
          {!bulkOpen ? (
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fg-1)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--info-bg)]"
            >
              <CameraIcon size={18} className="text-[var(--primary)]" />
              Escanear toda tu guía realizada
            </button>
          ) : (
            <div className="sp-rise rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[var(--fg-1)]">Escanear guía realizada</p>
                <button
                  type="button"
                  onClick={() => {
                    setBulkOpen(false);
                    setBulkPhotos([]);
                    setBulkError(null);
                  }}
                  aria-label="Cerrar escaneo de guía"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--fg-3)] transition-colors hover:bg-[var(--surface-2)]"
                >
                  <XIcon size={18} />
                </button>
              </div>
              <div className="mt-3">
                <MathPhotoUploader
                  value={bulkPhotos}
                  onChange={(files) => { setBulkPhotos(files); setBulkError(null); }}
                  max={questionCount}
                  disabled={bulkBusy}
                  hideFooter
                />
              </div>
              {bulkError ? (
                <p className="mt-2 text-xs font-medium text-[var(--error-fg)]">{bulkError}</p>
              ) : null}
              <button
                type="button"
                onClick={() => void submitWholeGuide()}
                disabled={bulkPhotos.length === 0 || bulkBusy}
                className="mt-3 w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bulkBusy ? 'Analizando…' : 'Enviar para corrección'}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar — free navigation (Canvas style) */}
        <aside className="flex max-h-[70vh] flex-col gap-1 overflow-auto">
          {questions.map((q) => {
            const s = subStates[q.id];
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedId(q.id)}
                className={[
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm',
                  q.id === selectedId
                    ? 'border-[var(--primary)] bg-[var(--info-bg)] font-bold text-[var(--fg-1)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--fg-2)] hover:border-[var(--primary)]/40',
                ].join(' ')}
              >
                <StatusGlyph s={s} />
                <span className="truncate">{q.label ?? `Pregunta ${q.sequence + 1}`}</span>
              </button>
            );
          })}
        </aside>

        {/* Question */}
        <section>
          {selected && sel ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-slate-900 px-5 py-5 text-center">
                <MathText className="text-lg leading-relaxed text-white">
                  {selected.statementLatex}
                </MathText>
              </div>

              {sel.status === 'NONE' || canRetry ? (
                <>
                  {sel.status === 'FAILED' ? (
                    <div className="flex items-center gap-2 rounded-xl bg-[var(--warning-bg)] px-4 py-3">
                      <AlertTriangleIcon size={16} className="shrink-0 text-[var(--warning-fg)]" />
                      <p className="text-sm text-[var(--warning-fg)]">
                        No pudimos analizar tu respuesta. Vuelve a intentarlo.
                      </p>
                    </div>
                  ) : null}
                  {canRetry ? (
                    <p className="math text-xs text-[var(--fg-3)]">
                      Intento {sel.attemptNumber + 1} de {quiz.guide.maxResubmissions + 1}
                    </p>
                  ) : null}
                  <MathPhotoUploader
                    value={filesByQ[selected.id] ?? []}
                    onChange={(files) => setFilesByQ((m) => ({ ...m, [selected.id]: files }))}
                    disabled={uploading === selected.id}
                  />
                  <button
                    type="button"
                    onClick={() => void submit(selected)}
                    disabled={
                      (filesByQ[selected.id] ?? []).length === 0 || uploading === selected.id
                    }
                    className="rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {uploading === selected.id ? 'Enviando…' : 'Entregar respuesta'}
                  </button>
                </>
              ) : IN_FLIGHT.has(sel.status) ? (
                <div className="rounded-2xl bg-[var(--info-bg)] px-5 py-6 text-center">
                  <LoaderIcon size={32} className="mx-auto animate-spin text-[var(--info-fg)]" />
                  <p className="mt-2 text-base font-bold text-[var(--info-fg)]">
                    Corrigiendo… ~1 min
                  </p>
                  <p className="mt-1 text-sm text-[var(--info-fg)]">
                    Puedes seguir con otra pregunta mientras tanto.
                  </p>
                </div>
              ) : sel.status === 'GRADED' ? (
                <div
                  className={[
                    'sp-rise rounded-2xl px-5 py-6 text-center',
                    sel.isCorrect ? 'bg-[var(--success-bg)]' : 'bg-[var(--warning-bg)]',
                  ].join(' ')}
                >
                  {sel.isCorrect ? (
                    <CheckCircleIcon size={40} className="mx-auto text-[var(--success-fg)]" />
                  ) : (
                    <AlertTriangleIcon size={40} className="mx-auto text-[var(--warning-fg)]" />
                  )}
                  <p
                    className={[
                      'mt-2 text-lg font-black',
                      sel.isCorrect ? 'text-[var(--success-fg)]' : 'text-[var(--warning-fg)]',
                    ].join(' ')}
                  >
                    {sel.isCorrect ? '¡Correcto!' : 'Casi lo tienes'}
                  </p>
                  {!sel.isCorrect && sel.errorTagCode ? (
                    <p className="mt-1 text-sm text-[var(--warning-fg)]">
                      Parece que el error fue:{' '}
                      <span className="font-semibold">
                        {sel.errorTagName ?? formatHumanName(sel.errorTagCode)}
                      </span>
                      .
                    </p>
                  ) : null}
                  {sel.diagnosticHint ? (
                    <p className="mt-2 text-sm text-[var(--warning-fg)]">{sel.diagnosticHint}</p>
                  ) : null}
                </div>
              ) : sel.status === 'FAILED' ? (
                <div className="rounded-2xl bg-[var(--warning-bg)] px-5 py-6 text-center">
                  <AlertTriangleIcon size={32} className="mx-auto text-[var(--warning-fg)]" />
                  <p className="mt-2 text-base font-bold text-[var(--warning-fg)]">
                    No pudimos analizar esta respuesta
                  </p>
                  <p className="mt-1 text-sm text-[var(--warning-fg)]">
                    Hubo un problema técnico al corregir. Avisa a tu profesor para que lo revise manualmente.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-[var(--surface-2)] px-5 py-6 text-center">
                  <CameraIcon size={32} className="mx-auto text-[var(--fg-3)]" />
                  <p className="mt-2 text-base font-bold text-[var(--fg-1)]">
                    No pudimos leer tu foto
                  </p>
                  <p className="mt-1 text-sm text-[var(--fg-2)]">
                    Vuelve a intentarlo con mejor luz y la hoja completa.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--fg-3)]">Esta guía no tiene preguntas disponibles.</p>
          )}
        </section>
      </div>
    </div>
  );
}
