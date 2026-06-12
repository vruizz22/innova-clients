'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CanonicalSolution,
  GuideQuestion,
  GuideQuestionStatus,
  SolutionStep,
  TopicCatalogEntry,
} from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { Latex } from '@/components/latex/Latex';
import { LatexEditor } from '@/components/latex/LatexEditor';
import { QuestionStatusBadge } from './status';

export interface ReviewWizardProps {
  readonly guideId: string;
  readonly title: string;
  readonly questions: readonly GuideQuestion[];
  readonly topics: readonly TopicCatalogEntry[];
  readonly initialDueAt: string | null;
  readonly initialMaxResubmissions: number;
  readonly initialShowSolution: boolean;
}

/** Local, editable view of a question's status + topic (drives list + publish gate). */
interface QuestionMeta {
  readonly status: GuideQuestionStatus;
  readonly topicId: string | null;
  readonly topicName: string | null;
  readonly topicConfidence: number | null;
}

export function ReviewWizard({
  guideId,
  title,
  questions,
  topics,
  initialDueAt,
  initialMaxResubmissions,
  initialShowSolution,
}: ReviewWizardProps): JSX.Element {
  const router = useRouter();
  const [meta, setMeta] = useState<Record<string, QuestionMeta>>(() =>
    Object.fromEntries(
      questions.map((q) => [
        q.id,
        {
          status: q.status,
          topicId: q.topicId,
          topicName: q.topic?.name ?? null,
          topicConfidence: q.topicConfidence ?? null,
        },
      ])
    )
  );
  const [selectedId, setSelectedId] = useState<string>(questions[0]?.id ?? '');
  const [publishOpen, setPublishOpen] = useState(false);

  const selected = questions.find((q) => q.id === selectedId) ?? null;

  const patchMeta = useCallback((id: string, partial: Partial<QuestionMeta>) => {
    setMeta((m) => ({ ...m, [id]: { ...m[id], ...partial } as QuestionMeta }));
  }, []);

  const allResolved = useMemo(
    () => questions.every((q) => {
      const s = meta[q.id]?.status;
      return s === 'APPROVED' || s === 'EXCLUDED';
    }),
    [questions, meta]
  );
  const anyApproved = useMemo(
    () => questions.some((q) => meta[q.id]?.status === 'APPROVED'),
    [questions, meta]
  );

  const approveHighConfidence = useCallback(async (): Promise<void> => {
    const api = getBrowserApi();
    for (const q of questions) {
      const m = meta[q.id];
      if (!m || m.status === 'EXCLUDED' || m.status === 'APPROVED') continue;
      if ((m.topicConfidence ?? 0) >= 0.85) {
        const res = await api.updateGuideQuestion(guideId, q.id, { status: 'APPROVED' });
        if (res.ok) patchMeta(q.id, { status: 'APPROVED' });
      }
    }
  }, [questions, meta, guideId, patchMeta]);

  return (
    <div className="mx-auto max-w-[1200px]" data-testid="review-wizard">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Revisa cada pauta y confirma el tema antes de publicar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void approveHighConfidence()}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Aprobar todas ≥85%
          </button>
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            disabled={!allResolved || !anyApproved}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publicar
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Panel 1 — questions list */}
        <aside className="flex max-h-[70vh] flex-col gap-2 overflow-auto">
          {questions.map((q) => {
            const m = meta[q.id];
            const conf = m?.topicConfidence;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedId(q.id)}
                className={[
                  'rounded-xl border p-3 text-left',
                  q.id === selectedId
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-sky-300',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    {q.label ?? `Pregunta ${q.sequence + 1}`}
                  </span>
                  {m ? <QuestionStatusBadge status={m.status} /> : null}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {m?.topicName ?? 'Sin tema'}
                  {conf !== null && conf !== undefined ? ` · ${Math.round(conf * 100)}%` : ''}
                </p>
              </button>
            );
          })}
        </aside>

        {/* Panels 2+3 — editor */}
        <section>
          {selected ? (
            <QuestionEditor
              key={selected.id}
              guideId={guideId}
              question={selected}
              topics={topics}
              onMeta={(partial) => patchMeta(selected.id, partial)}
            />
          ) : (
            <p className="text-sm text-slate-400">Esta guía no tiene preguntas.</p>
          )}
        </section>
      </div>

      {publishOpen ? (
        <PublishModal
          guideId={guideId}
          initialDueAt={initialDueAt}
          initialMaxResubmissions={initialMaxResubmissions}
          initialShowSolution={initialShowSolution}
          onClose={() => setPublishOpen(false)}
          onPublished={() => {
            router.push(`/guides/${guideId}/results`);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- editor ----
interface DraftStep {
  latex: string;
  checkpoint: boolean;
  explanation_es?: string;
  rule?: string;
  expected_error_tags?: string[];
}

interface QuestionEditorProps {
  readonly guideId: string;
  readonly question: GuideQuestion;
  readonly topics: readonly TopicCatalogEntry[];
  readonly onMeta: (partial: Partial<QuestionMeta>) => void;
}

function toDraftSteps(steps: readonly SolutionStep[]): DraftStep[] {
  return steps.map((s) => ({
    latex: s.latex,
    checkpoint: s.checkpoint ?? false,
    ...(s.explanation_es ? { explanation_es: s.explanation_es } : {}),
    ...(s.rule ? { rule: s.rule } : {}),
    ...(s.expected_error_tags ? { expected_error_tags: s.expected_error_tags } : {}),
  }));
}

function QuestionEditor({ guideId, question, topics, onMeta }: QuestionEditorProps): JSX.Element {
  const current = question.solutions[0] ?? null;
  const [statementLatex, setStatementLatex] = useState(question.statementLatex);
  const [points, setPoints] = useState(String(question.points));
  const [topicId, setTopicId] = useState(question.topicId ?? '');
  const [finalAnswer, setFinalAnswer] = useState(current?.stepsJson.final_answer ?? '');
  const [steps, setSteps] = useState<DraftStep[]>(
    current ? toDraftSteps(current.stepsJson.steps) : []
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const run = useCallback(
    async (key: string, fn: () => Promise<boolean>, okText: string) => {
      setBusy(key);
      setNote(null);
      const ok = await fn();
      setBusy(null);
      setNote({ ok, text: ok ? okText : 'No se pudo guardar. Intenta de nuevo.' });
    },
    []
  );

  const saveStatement = () =>
    run(
      'statement',
      async () => {
        const res = await getBrowserApi().updateGuideQuestion(guideId, question.id, {
          statementLatex,
          points: Number(points) || 0,
        });
        return res.ok;
      },
      'Enunciado guardado.'
    );

  const confirmTopic = () =>
    run(
      'topic',
      async () => {
        if (!topicId) return false;
        const res = await getBrowserApi().updateGuideQuestion(guideId, question.id, { topicId });
        if (res.ok) {
          const t = topics.find((x) => x.id === topicId);
          onMeta({ topicId, topicName: t?.name ?? null, topicConfidence: 1 });
        }
        return res.ok;
      },
      'Tema confirmado.'
    );

  const saveSolution = () =>
    run(
      'solution',
      async () => {
        if (!steps.some((s) => s.checkpoint)) {
          setNote({ ok: false, text: 'Marca al menos un paso como checkpoint.' });
          return false;
        }
        const stepsJson: CanonicalSolution = {
          final_answer: finalAnswer.trim(),
          steps: steps.map((s, i) => ({
            idx: i + 1,
            latex: s.latex,
            checkpoint: s.checkpoint,
            ...(s.explanation_es ? { explanation_es: s.explanation_es } : {}),
            ...(s.rule ? { rule: s.rule } : {}),
            ...(s.expected_error_tags ? { expected_error_tags: s.expected_error_tags } : {}),
          })),
        };
        const res = await getBrowserApi().updateGuideSolution(guideId, question.id, {
          finalAnswer: finalAnswer.trim(),
          stepsJson,
        });
        return res.ok;
      },
      'Pauta guardada (nueva versión).'
    );

  const setStatus = (status: 'APPROVED' | 'EXCLUDED') =>
    run(
      status,
      async () => {
        const res = await getBrowserApi().updateGuideQuestion(guideId, question.id, { status });
        if (res.ok) onMeta({ status });
        return res.ok;
      },
      status === 'APPROVED' ? 'Pregunta aprobada.' : 'Pregunta excluida.'
    );

  const regenerate = () =>
    run(
      'regen',
      async () => (await getBrowserApi().regenerateSolution(guideId, question.id)).ok,
      'Pedimos una nueva pauta. Refresca en un momento.'
    );

  return (
    <div className="flex flex-col gap-5">
      {/* Statement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Enunciado</p>
        <div className="mt-2">
          <LatexEditor value={statementLatex} onChange={setStatementLatex} rows={3} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Puntos
            <input
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              inputMode="decimal"
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={saveStatement}
            disabled={busy !== null}
            className="ml-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            {busy === 'statement' ? 'Guardando…' : 'Guardar enunciado'}
          </button>
        </div>
      </div>

      {/* Topic */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tema</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="min-w-[240px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Sin tema</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={confirmTopic}
            disabled={busy !== null || !topicId}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            {busy === 'topic' ? 'Confirmando…' : 'Confirmar tema'}
          </button>
        </div>
      </div>

      {/* Solution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pauta {current ? `· v${current.version} · ${current.source}` : '· (sin pauta aún)'}
          </p>
          <button
            type="button"
            onClick={regenerate}
            disabled={busy !== null}
            className="text-xs font-semibold text-sky-600 hover:underline disabled:opacity-40"
          >
            Regenerar con IA
          </button>
        </div>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Respuesta final
          </span>
          <input
            value={finalAnswer}
            onChange={(e) => setFinalAnswer(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Ej: 27"
          />
        </label>

        <div className="mt-3 flex flex-col gap-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Paso {i + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={s.checkpoint}
                      onChange={(e) =>
                        setSteps((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, checkpoint: e.target.checked } : r))
                        )
                      }
                    />
                    checkpoint
                  </label>
                  <button
                    type="button"
                    onClick={() => setSteps((rows) => rows.filter((_, j) => j !== i))}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <LatexEditor
                  value={s.latex}
                  onChange={(v) =>
                    setSteps((rows) => rows.map((r, j) => (j === i ? { ...r, latex: v } : r)))
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSteps((rows) => [...rows, { latex: '', checkpoint: rows.length === 0 }])}
            className="self-start rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            + Agregar paso
          </button>
        </div>

        <button
          type="button"
          onClick={saveSolution}
          disabled={busy !== null}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40"
        >
          {busy === 'solution' ? 'Guardando…' : 'Guardar pauta'}
        </button>
      </div>

      {note ? (
        <p
          className={[
            'rounded-xl px-4 py-2 text-sm font-medium',
            note.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
          ].join(' ')}
        >
          {note.text}
        </p>
      ) : null}

      {/* Per-question verdict */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStatus('EXCLUDED')}
          disabled={busy !== null}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          Excluir
        </button>
        <button
          type="button"
          onClick={() => setStatus('APPROVED')}
          disabled={busy !== null}
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-40"
        >
          Aprobar pregunta
        </button>
      </div>

      {/* Reference: statement preview */}
      <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center">
        <Latex display className="text-white">
          {statementLatex || '\\text{(enunciado vacío)}'}
        </Latex>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- publish ----
interface PublishModalProps {
  readonly guideId: string;
  readonly initialDueAt: string | null;
  readonly initialMaxResubmissions: number;
  readonly initialShowSolution: boolean;
  readonly onClose: () => void;
  readonly onPublished: () => void;
}

function PublishModal({
  guideId,
  initialDueAt,
  initialMaxResubmissions,
  initialShowSolution,
  onClose,
  onPublished,
}: PublishModalProps): JSX.Element {
  const [dueAt, setDueAt] = useState(initialDueAt ? initialDueAt.slice(0, 10) : '');
  const [maxResubmissions, setMaxResubmissions] = useState(String(initialMaxResubmissions));
  const [showSolution, setShowSolution] = useState(initialShowSolution);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = useCallback(async (): Promise<void> => {
    setBusy(true);
    setError(null);
    const api = getBrowserApi();
    const update = await api.updateGuide(guideId, {
      maxResubmissions: Number(maxResubmissions) || 0,
      showSolutionAfterGrade: showSolution,
      ...(dueAt ? { dueAt: new Date(dueAt).toISOString() } : {}),
    });
    if (!update.ok) {
      setBusy(false);
      setError('No pudimos guardar la configuración.');
      return;
    }
    const res = await api.publishGuide(guideId);
    setBusy(false);
    if (res.ok) onPublished();
    else setError('No pudimos publicar. Revisa que todas las preguntas estén resueltas.');
  }, [guideId, dueAt, maxResubmissions, showSolution, onPublished]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <p className="text-lg font-bold text-slate-900">Publicar guía</p>
        <p className="mt-1 text-sm text-slate-500">
          Tus alumnos podrán verla y entregar sus desarrollos.
        </p>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Fecha de entrega
          </span>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Reenvíos permitidos por alumno
          </span>
          <input
            value={maxResubmissions}
            onChange={(e) => setMaxResubmissions(e.target.value)}
            inputMode="numeric"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showSolution}
            onChange={(e) => setShowSolution(e.target.checked)}
          />
          Mostrar la pauta al alumno después de corregir
        </label>

        {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={busy}
            className="flex-1 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-40"
          >
            {busy ? 'Publicando…' : 'Publicar ahora'}
          </button>
        </div>
      </div>
    </div>
  );
}
