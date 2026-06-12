'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Quiz, QuizQuestion, SubmissionStatus } from '@innova/api-client';
import { formatHumanName } from '@innova/error-catalog';
import { getBrowserApi } from '@/lib/api.client';
import { Latex } from '@/components/latex/Latex';
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
  diagnosticHint: string | null;
  attemptNumber: number;
}

const IN_FLIGHT: ReadonlySet<Status> = new Set<Status>(['UPLOADED', 'TRANSCRIBING', 'GRADING']);

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
          diagnosticHint: null,
          attemptNumber: latest.attemptNumber,
        }
      : {
          submissionId: null,
          status: 'NONE',
          score: null,
          isCorrect: null,
          errorTagCode: null,
          diagnosticHint: null,
          attemptNumber: 0,
        };
  }
  return out;
}

function statusIcon(s: SubState): string {
  if (s.status === 'NONE') return '⬜';
  if (s.status === 'GRADED') return s.isCorrect ? '✅' : '❌';
  if (s.status === 'FAILED') return '⚠️';
  return '⏳';
}

export function QuizView({ guideId, quiz }: QuizViewProps): JSX.Element {
  const { questions } = quiz;
  const [subStates, setSubStates] = useState<Record<string, SubState>>(() => initialState(questions));
  const [filesByQ, setFilesByQ] = useState<Record<string, File[]>>({});
  const [selectedId, setSelectedId] = useState<string>(questions[0]?.id ?? '');
  const [uploading, setUploading] = useState<string | null>(null);

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
        const res = await api.getSubmissionStatus(s.submissionId);
        if (res.ok) {
          patch(qid, {
            status: res.data.status,
            score: res.data.score,
            isCorrect: res.data.isCorrect,
            errorTagCode: res.data.errorTagCode,
            diagnosticHint: res.data.diagnosticHint,
          });
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [hasInFlight, patch]);

  // Enrich a graded selection with the error explanation (not in the quiz payload).
  useEffect(() => {
    const s = stateRef.current[selectedId];
    if (s && s.submissionId && s.status === 'GRADED' && s.errorTagCode === null && s.isCorrect === false) {
      void getBrowserApi()
        .getSubmissionStatus(s.submissionId)
        .then((res) => {
          if (res.ok) {
            patch(selectedId, {
              errorTagCode: res.data.errorTagCode,
              diagnosticHint: res.data.diagnosticHint,
            });
          }
        });
    }
  }, [selectedId, patch]);

  const submit = useCallback(
    async (q: QuizQuestion): Promise<void> => {
      const files = filesByQ[q.id] ?? [];
      if (files.length === 0) return;
      setUploading(q.id);
      const api = getBrowserApi();

      const created = await api.createSubmission(guideId, q.id, { photoCount: files.length });
      if (!created.ok) {
        setUploading(null);
        patch(q.id, { status: 'FAILED' });
        return;
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
        setUploading(null);
        patch(q.id, { status: 'FAILED' });
        return;
      }
      const done = await api.completeSubmission(created.data.submissionId);
      setUploading(null);
      if (!done.ok) {
        patch(q.id, { status: 'FAILED' });
        return;
      }
      setFilesByQ((m) => ({ ...m, [q.id]: [] }));
      patch(q.id, {
        submissionId: created.data.submissionId,
        status: 'GRADING',
        attemptNumber: created.data.attemptNumber,
        isCorrect: null,
        score: null,
        errorTagCode: null,
        diagnosticHint: null,
      });
    },
    [filesByQ, guideId, patch]
  );

  const selected = questions.find((q) => q.id === selectedId) ?? null;
  const sel = selected ? subStates[selected.id] : null;
  const canRetry =
    sel !== null &&
    (sel.status === 'GRADED' || sel.status === 'FAILED') &&
    sel.attemptNumber <= quiz.guide.maxResubmissions;

  return (
    <div className="mx-auto max-w-[1100px]" data-testid="quiz-root">
      <div className="flex items-center justify-between gap-3">
        <Link href="/guides" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          ← Mis guías
        </Link>
        <Link href={`/guides/${guideId}/results`} className="text-sm font-medium text-sky-600">
          Ver mi resumen →
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{quiz.guide.title}</h1>

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
                    ? 'border-sky-500 bg-sky-50 font-bold text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300',
                ].join(' ')}
              >
                <span>{statusIcon(s)}</span>
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
                <Latex display className="text-white">
                  {selected.statementLatex}
                </Latex>
              </div>

              {sel.status === 'NONE' || canRetry ? (
                <>
                  {canRetry ? (
                    <p className="text-xs text-slate-400">
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
                    disabled={(filesByQ[selected.id] ?? []).length === 0 || uploading === selected.id}
                    className="rounded-xl bg-sky-500 px-5 py-3 text-base font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {uploading === selected.id ? 'Enviando…' : 'Entregar respuesta'}
                  </button>
                </>
              ) : IN_FLIGHT.has(sel.status) ? (
                <div className="rounded-2xl bg-sky-50 px-5 py-6 text-center">
                  <p className="text-3xl">⏳</p>
                  <p className="mt-2 text-base font-bold text-sky-800">Corrigiendo… ~1 min</p>
                  <p className="mt-1 text-sm text-sky-600">
                    Puedes seguir con otra pregunta mientras tanto.
                  </p>
                </div>
              ) : sel.status === 'GRADED' ? (
                <div
                  className={[
                    'rounded-2xl px-5 py-6 text-center',
                    sel.isCorrect ? 'bg-emerald-50' : 'bg-amber-50',
                  ].join(' ')}
                >
                  <p className="text-4xl">{sel.isCorrect ? '🎉' : '💪'}</p>
                  <p
                    className={[
                      'mt-2 text-lg font-black',
                      sel.isCorrect ? 'text-emerald-700' : 'text-amber-700',
                    ].join(' ')}
                  >
                    {sel.isCorrect ? '¡Correcto!' : 'Casi lo tienes'}
                  </p>
                  {!sel.isCorrect && sel.errorTagCode ? (
                    <p className="mt-1 text-sm text-amber-700">
                      Parece que el error fue:{' '}
                      <span className="font-semibold">{formatHumanName(sel.errorTagCode)}</span>.
                    </p>
                  ) : null}
                  {sel.diagnosticHint ? (
                    <p className="mt-2 text-sm text-amber-700">{sel.diagnosticHint}</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl bg-rose-50 px-5 py-6 text-center">
                  <p className="text-3xl">⚠️</p>
                  <p className="mt-2 text-base font-bold text-rose-700">No pudimos leer tu foto</p>
                  <p className="mt-1 text-sm text-rose-600">
                    Vuelve a intentarlo con mejor luz y la hoja completa.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Esta guía no tiene preguntas disponibles.</p>
          )}
        </section>
      </div>
    </div>
  );
}
