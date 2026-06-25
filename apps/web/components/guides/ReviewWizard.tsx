'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Flag,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CanonicalSolution,
  GuideQuestion,
  GuideQuestionStatus,
  SolutionSource,
  SolutionStep,
  TaxonomyDomain,
  TaxonomyRef,
} from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { LatexEditor } from '@/components/latex/LatexEditor';
import { MathText } from '@/components/latex/MathText';
import { QuestionStatusBadge } from './status';

export interface ReviewWizardProps {
  readonly guideId: string;
  readonly title: string;
  readonly questions: readonly GuideQuestion[];
  readonly taxonomy: readonly TaxonomyDomain[];
  readonly initialDueAt: string | null;
  readonly initialMaxResubmissions: number;
  readonly initialShowSolution: boolean;
}

/** Local, editable view of a question's status + classification (drives list + publish gate). */
interface QuestionMeta {
  readonly status: GuideQuestionStatus;
  readonly subdomainId: string | null;
  /** "Domain · Subdomain" display label, or null when unclassified. */
  readonly classification: string | null;
  /** Kept only for the "approve ≥85%" bulk action threshold. */
  readonly topicConfidence: number | null;
}

const SOURCE_LABEL: Record<SolutionSource, string> = {
  PDF_PROVIDED: 'desde la guía',
  LLM_GENERATED: 'generada por IA',
  TEACHER_EDITED: 'editada por ti',
};

/** "Domain · Subdomain" — the human label for a question's taxonomy classification. */
function classificationLabel(
  domain: TaxonomyRef | null | undefined,
  subdomain: TaxonomyRef | null | undefined
): string | null {
  if (!subdomain) return null;
  return domain ? `${domain.name} · ${subdomain.name}` : subdomain.name;
}

export function ReviewWizard({
  guideId,
  title,
  questions,
  taxonomy,
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
          subdomainId: q.subdomain?.id ?? null,
          classification: classificationLabel(q.domain, q.subdomain),
          topicConfidence: q.topicConfidence ?? null,
        },
      ])
    )
  );
  const [selectedId, setSelectedId] = useState<string>(questions[0]?.id ?? '');
  const [publishOpen, setPublishOpen] = useState(false);

  const selected = questions.find((q) => q.id === selectedId) ?? null;
  const selectedPos =
    Math.max(
      0,
      questions.findIndex((q) => q.id === selectedId)
    ) + 1;

  const patchMeta = useCallback((id: string, partial: Partial<QuestionMeta>) => {
    setMeta((m) => ({ ...m, [id]: { ...m[id], ...partial } as QuestionMeta }));
  }, []);

  const resolvedCount = useMemo(
    () =>
      questions.filter((q) => {
        const s = meta[q.id]?.status;
        return s === 'APPROVED' || s === 'EXCLUDED';
      }).length,
    [questions, meta]
  );
  const allResolved = resolvedCount === questions.length && questions.length > 0;
  const anyApproved = useMemo(
    () => questions.some((q) => meta[q.id]?.status === 'APPROVED'),
    [questions, meta]
  );
  const pct = questions.length ? Math.round((resolvedCount / questions.length) * 100) : 0;
  const canPublish = allResolved && anyApproved;

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
    <div className="mx-auto max-w-[1240px]" data-testid="review-wizard">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-1)]">{title}</h1>
          <p className="mt-1 text-sm text-[var(--fg-2)]">
            Revisa cada pauta y confirma el tema antes de publicar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void approveHighConfidence()}
            className="sp-press inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)]"
          >
            <Check className="h-4 w-4" /> Aprobar todas ≥85%
          </button>
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            disabled={!canPublish}
            title={
              canPublish
                ? undefined
                : 'Aprueba o excluye todas las preguntas (con al menos una aprobada) para publicar.'
            }
            className="sp-press rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publicar
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-[var(--fg-2)]">
          {resolvedCount} de {questions.length} listas
        </span>
      </div>
      {!canPublish ? (
        <p className="mt-1.5 text-xs text-[var(--fg-3)]">
          Aprueba o excluye cada pregunta (con al menos una aprobada) para habilitar «Publicar».
        </p>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Panel 1 — questions navigator */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <nav className="sp-stagger flex max-h-[calc(100vh-7rem)] flex-col gap-2 overflow-auto pr-1">
            {questions.map((q, i) => {
              const m = meta[q.id];
              const isSel = q.id === selectedId;
              const label = m?.classification;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedId(q.id)}
                  aria-current={isSel}
                  className={[
                    'rounded-2xl border p-3 text-left transition-colors duration-150',
                    isSel
                      ? 'border-[var(--primary)] bg-[var(--info-bg)] shadow-[var(--shadow-card)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={[
                        'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                        isSel
                          ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                          : 'bg-[var(--surface-2)] text-[var(--fg-2)]',
                      ].join(' ')}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--fg-1)]">
                      {q.label ?? `Pregunta ${i + 1}`}
                    </span>
                    {m ? <QuestionStatusBadge status={m.status} /> : null}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 pl-[2.375rem] text-xs">
                    {label ? (
                      <span className="min-w-0 truncate text-[var(--fg-2)]">{label}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-[var(--warning-fg)]">
                        <AlertCircle className="h-3.5 w-3.5" /> Tema por confirmar
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Panel 2 — editor */}
        <section className="min-w-0">
          {selected ? (
            <QuestionEditor
              key={selected.id}
              guideId={guideId}
              position={selectedPos}
              question={selected}
              taxonomy={taxonomy}
              onMeta={(partial) => patchMeta(selected.id, partial)}
            />
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <p className="text-sm text-[var(--fg-3)]">Esta guía no tiene preguntas.</p>
            </div>
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
  readonly position: number;
  readonly question: GuideQuestion;
  readonly taxonomy: readonly TaxonomyDomain[];
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

type SaveResult = { ok: boolean; msg?: string };
type Note = { ok: boolean; text: string };

function QuestionEditor({
  guideId,
  position,
  question,
  taxonomy,
  onMeta,
}: QuestionEditorProps): JSX.Element {
  const current = question.solutions[0] ?? null;
  const altPaths = current?.stepsJson.alt_paths;

  const findClassification = (subId: string): string | null => {
    for (const d of taxonomy) {
      const s = d.subdomains.find((x) => x.id === subId);
      if (s) return `${d.name} · ${s.name}`;
    }
    return null;
  };

  const [statementLatex, setStatementLatex] = useState(question.statementLatex);
  const [points, setPoints] = useState(String(question.points));
  const [subdomainId, setSubdomainId] = useState(question.subdomain?.id ?? '');
  const [finalAnswer, setFinalAnswer] = useState(current?.stepsJson.final_answer ?? '');
  const [steps, setSteps] = useState<DraftStep[]>(
    current ? toDraftSteps(current.stepsJson.steps) : []
  );
  const [status, setStatus] = useState<GuideQuestionStatus>(question.status);
  const [editingStatement, setEditingStatement] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);

  const initialKey = useMemo(
    () =>
      JSON.stringify({
        fa: current?.stepsJson.final_answer ?? '',
        steps: current ? toDraftSteps(current.stepsJson.steps) : [],
      }),
    [current]
  );
  const solutionDirty = JSON.stringify({ fa: finalAnswer, steps }) !== initialKey;

  const updateStep = (i: number, partial: Partial<DraftStep>) =>
    setSteps((rows) => rows.map((r, j) => (j === i ? { ...r, ...partial } : r)));
  const removeStep = (i: number) => setSteps((rows) => rows.filter((_, j) => j !== i));
  const addStep = () => setSteps((rows) => [...rows, { latex: '', checkpoint: rows.length === 0 }]);

  const run = useCallback(async (key: string, fn: () => Promise<SaveResult>, okText: string) => {
    setBusy(key);
    setNote(null);
    const res = await fn();
    setBusy(null);
    setNote({
      ok: res.ok,
      text: res.ok ? okText : res.msg ?? 'No se pudo guardar. Intenta de nuevo.',
    });
  }, []);

  const buildStepsJson = (): CanonicalSolution => ({
    final_answer: finalAnswer.trim(),
    points: Number(points) || 0,
    steps: steps.map((s, i) => ({
      idx: i,
      latex: s.latex,
      checkpoint: s.checkpoint,
      ...(s.explanation_es ? { explanation_es: s.explanation_es } : {}),
      ...(s.rule ? { rule: s.rule } : {}),
      ...(s.expected_error_tags ? { expected_error_tags: s.expected_error_tags } : {}),
    })),
    ...(altPaths && altPaths.length > 0 ? { alt_paths: altPaths } : {}),
  });

  /** Persists statement+points+topic, and the pauta only when it actually changed. */
  const persist = async (): Promise<SaveResult> => {
    const api = getBrowserApi();
    const qRes = await api.updateGuideQuestion(guideId, question.id, {
      statementLatex,
      points: Number(points) || 0,
      ...(subdomainId ? { subdomainId } : {}),
    });
    if (!qRes.ok) return { ok: false, msg: 'No pudimos guardar el enunciado.' };
    if (subdomainId) {
      onMeta({ subdomainId, classification: findClassification(subdomainId), topicConfidence: 1 });
    }
    if (solutionDirty) {
      if (!steps.some((s) => s.checkpoint)) {
        return {
          ok: false,
          msg: 'Marca al menos un paso como checkpoint antes de guardar la pauta.',
        };
      }
      const sRes = await api.updateGuideSolution(guideId, question.id, {
        finalAnswer: finalAnswer.trim(),
        stepsJson: buildStepsJson(),
      });
      if (!sRes.ok) return { ok: false, msg: 'No pudimos guardar la pauta. Revisa los pasos.' };
    }
    return { ok: true };
  };

  const saveAll = () =>
    run('save', persist, solutionDirty ? 'Cambios y pauta guardados.' : 'Cambios guardados.');

  const approve = () =>
    run(
      'approve',
      async () => {
        const p = await persist();
        if (!p.ok) return p;
        const res = await getBrowserApi().updateGuideQuestion(guideId, question.id, {
          status: 'APPROVED',
        });
        if (res.ok) {
          setStatus('APPROVED');
          onMeta({ status: 'APPROVED' });
        }
        return { ok: res.ok };
      },
      'Pregunta aprobada.'
    );

  const exclude = () =>
    run(
      'exclude',
      async () => {
        const res = await getBrowserApi().updateGuideQuestion(guideId, question.id, {
          status: 'EXCLUDED',
        });
        if (res.ok) {
          setStatus('EXCLUDED');
          onMeta({ status: 'EXCLUDED' });
        }
        return { ok: res.ok };
      },
      'Pregunta excluida.'
    );

  const regenerate = () =>
    run(
      'regen',
      async () => ({ ok: (await getBrowserApi().regenerateSolution(guideId, question.id)).ok }),
      'Pedimos una nueva pauta. Refresca en un momento.'
    );

  const pointsNum = Number(points) || 0;

  return (
    <article className="sp-rise overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      {/* A — statement */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-bold text-[var(--fg-2)]">
              Pregunta {position}
            </span>
            <QuestionStatusBadge status={status} />
          </div>
          <button
            type="button"
            onClick={() => setEditingStatement((v) => !v)}
            className="sp-press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)]"
          >
            <PencilLine className="h-3.5 w-3.5" /> {editingStatement ? 'Listo' : 'Editar enunciado'}
          </button>
        </div>

        {editingStatement ? (
          <div className="mt-3 space-y-3">
            <LatexEditor
              value={statementLatex}
              onChange={setStatementLatex}
              rows={3}
              label="Enunciado (LaTeX)"
              mixed
            />
            <label className="flex items-center gap-2 text-sm text-[var(--fg-2)]">
              Puntos
              <input
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                inputMode="decimal"
                className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
              />
            </label>
          </div>
        ) : (
          <div className="mt-3">
            <div className="rounded-xl bg-[var(--surface-2)] px-5 py-6">
              {statementLatex ? (
                <MathText className="latex-lg leading-relaxed text-[var(--fg-1)]">
                  {statementLatex}
                </MathText>
              ) : (
                <span className="text-sm italic text-[var(--fg-3)]">(enunciado vacío)</span>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--fg-3)]">
              Vale {pointsNum} {pointsNum === 1 ? 'punto' : 'puntos'}
            </p>
          </div>
        )}
      </div>

      {/* B — classification (taxonomy domain/subdomain) */}
      <div className="border-t border-[var(--border)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">Tema</p>
            <p className="mt-0.5 text-sm text-[var(--fg-2)]">
              Se detecta del contenido y define cómo se analizan los errores. Ajústalo si no calza.
            </p>
          </div>
          {subdomainId ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--success-fg)]">
              <Check className="h-3.5 w-3.5" /> Clasificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--warning-fg)]">
              <AlertCircle className="h-3.5 w-3.5" /> Por confirmar
            </span>
          )}
        </div>
        <div className="relative mt-3">
          <select
            value={subdomainId}
            onChange={(e) => setSubdomainId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 pr-10 text-sm text-[var(--fg-1)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--info-bg)]"
          >
            <option value="">— Sin clasificar —</option>
            {taxonomy.map((d) => (
              <optgroup key={d.id} label={d.name}>
                {d.subdomains.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-3)]" />
        </div>
      </div>

      {/* C — pauta */}
      <div className="border-t border-[var(--border)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
              Pauta
            </p>
            {current ? (
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-3)]">
                v{current.version} · {SOURCE_LABEL[current.source]}
              </span>
            ) : (
              <span className="text-xs text-[var(--fg-3)]">sin pauta aún</span>
            )}
          </div>
          <button
            type="button"
            onClick={regenerate}
            disabled={busy !== null}
            className="sp-press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--info-bg)] disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />{' '}
            {busy === 'regen' ? 'Pidiendo…' : 'Regenerar con IA'}
          </button>
        </div>

        {/* final answer */}
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <LatexEditor
            label="Respuesta final"
            value={finalAnswer}
            onChange={setFinalAnswer}
            placeholder="Ej: \dfrac{23}{20}"
          />
        </div>

        {/* steps */}
        <div className="sp-stagger mt-3 flex flex-col gap-3">
          {steps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[var(--fg-2)]">
                Esta pregunta aún no tiene pauta
              </p>
              <p className="mt-1 text-xs text-[var(--fg-3)]">
                Agrega los pasos de la solución, o pídele una a la IA con «Regenerar».
              </p>
            </div>
          ) : null}
          {steps.map((s, i) => (
            <div
              key={i}
              className={[
                'rounded-xl border p-3 transition-colors',
                s.checkpoint
                  ? 'border-[var(--primary)] bg-[var(--info-bg)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--fg-2)]">
                  <span
                    className={[
                      'grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold transition-colors',
                      s.checkpoint
                        ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                        : 'bg-[var(--surface)] text-[var(--fg-2)]',
                    ].join(' ')}
                  >
                    {i + 1}
                  </span>
                  Paso {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <CheckpointToggle
                    checked={s.checkpoint}
                    onChange={(v) => updateStep(i, { checkpoint: v })}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    aria-label={`Eliminar paso ${i + 1}`}
                    className="sp-press grid h-8 w-8 place-items-center rounded-lg text-[var(--fg-3)] transition-colors hover:bg-[var(--error-bg)] hover:text-[var(--error-fg)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <LatexEditor
                  value={s.latex}
                  onChange={(v) => updateStep(i, { latex: v })}
                  rows={2}
                />
              </div>
              <input
                value={s.explanation_es ?? ''}
                onChange={(e) => updateStep(i, { explanation_es: e.target.value })}
                placeholder="Explicación para el alumno (opcional)"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="sp-press inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-dashed border-[var(--border-strong)] px-3.5 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <Plus className="h-4 w-4" /> Agregar paso
          </button>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--fg-3)]">
          <Flag className="h-3.5 w-3.5" /> Marca como{' '}
          <strong className="font-semibold text-[var(--fg-2)]">checkpoint</strong> los pasos que el
          alumno debe acertar.
        </p>
      </div>

      {/* action bar */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
        <button
          type="button"
          onClick={exclude}
          disabled={busy !== null}
          className="sp-press inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
        >
          <X className="h-4 w-4" /> {busy === 'exclude' ? 'Excluyendo…' : 'Excluir'}
        </button>
        {note ? (
          <span
            key={note.text}
            className={[
              'sp-rise inline-flex items-center gap-1.5 text-sm font-medium',
              note.ok ? 'text-[var(--success-fg)]' : 'text-[var(--error-fg)]',
            ].join(' ')}
            role="status"
          >
            {note.ok ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {note.text}
          </span>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={saveAll}
            disabled={busy !== null}
            className="sp-press rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--fg-1)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            {busy === 'save' ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={approve}
            disabled={busy !== null}
            className="sp-press inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> {busy === 'approve' ? 'Aprobando…' : 'Aprobar pregunta'}
          </button>
        </div>
      </div>
    </article>
  );
}

interface CheckpointToggleProps {
  readonly checked: boolean;
  readonly onChange: (value: boolean) => void;
}

function CheckpointToggle({ checked, onChange }: CheckpointToggleProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Marcar como checkpoint"
      onClick={() => onChange(!checked)}
      className={[
        'sp-press inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors',
        checked
          ? 'bg-[var(--info-bg)] text-[var(--info-fg)]'
          : 'text-[var(--fg-3)] hover:bg-[var(--surface)]',
      ].join(' ')}
    >
      <span
        className={[
          'relative h-4 w-7 rounded-full transition-colors',
          checked ? 'bg-[var(--primary)]' : 'bg-[var(--border-strong)]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform duration-150 ease-out',
            checked ? 'translate-x-3' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      checkpoint
    </button>
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,18,27,0.55)] p-4"
      onClick={() => (busy ? null : onClose())}
      role="presentation"
    >
      <div
        className="sp-rise w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Publicar guía"
      >
        <p className="text-lg font-bold text-[var(--fg-1)]">Publicar guía</p>
        <p className="mt-1 text-sm text-[var(--fg-2)]">
          Tus alumnos podrán verla y entregar sus desarrollos.
        </p>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
            Fecha de entrega
          </span>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-3)]">
            Reenvíos permitidos por alumno
          </span>
          <input
            value={maxResubmissions}
            onChange={(e) => setMaxResubmissions(e.target.value)}
            inputMode="numeric"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg-1)] outline-none focus:border-[var(--primary)]"
          />
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm text-[var(--fg-1)]">
          <input
            type="checkbox"
            checked={showSolution}
            onChange={(e) => setShowSolution(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          Mostrar la pauta al alumno después de corregir
        </label>

        {error ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--error-fg)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="sp-press rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg-2)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={busy}
            className="sp-press flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-40"
          >
            {busy ? 'Publicando…' : 'Publicar ahora'}
          </button>
        </div>
      </div>
    </div>
  );
}
