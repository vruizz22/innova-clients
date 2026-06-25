import Link from 'next/link';
import { Card, CheckCircleIcon, AlertTriangleIcon, EmptyState, StatCard } from '@innova/ui';
import { formatHumanName } from '@innova/error-catalog';
import type { GuideResults } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { getCurrentRole } from '@/lib/role.server';
import { Latex } from '@/components/latex/Latex';
import { ResultsMatrix } from '@/components/guides/ResultsMatrix';

// Shared `/guides/[guideId]/results` — teacher's Student × Question matrix (C11)
// or the student's self-only summary, branched by role (Server Component).
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

// ---------------------------------------------------------- teacher (C11) ----
async function TeacherResultsMatrix({ guideId }: { guideId: string }): Promise<JSX.Element> {
  const api = getServerApi();
  const [matrix, guide] = await Promise.all([
    api.getGuideResultsMatrix(guideId),
    api.getGuide(guideId),
  ]);

  if (!matrix.ok) {
    return (
      <div className="mx-auto max-w-[720px]">
        <EmptyState
          kind="error"
          title="No pudimos cargar los resultados"
          body={
            matrix.error.kind === 'http' && matrix.error.status === 403
              ? 'No tienes acceso a esta guía.'
              : 'Intenta de nuevo en un momento.'
          }
          action={
            <Link href="/guides" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
              ← Mis guías
            </Link>
          }
        />
      </div>
    );
  }

  const title = guide.ok ? guide.data.title : 'Resultados';
  return <ResultsMatrix guideId={guideId} title={title} matrix={matrix.data} />;
}

// ---------------------------------------------------------- student view ----
type ResultQuestion = GuideResults['questions'][number];

/** Codes the classifier returns when there is no procedural error. */
const CORRECT_CODES = new Set(['CORRECT', 'NONE', '']);

type GradeKind = 'pending' | 'correct' | 'missing-steps' | 'error';

/**
 * Distinguishes a real procedural error from "the answer is right but the student
 * solved it directly without the checkpoint steps the pauta requires" — the latter
 * scores partial but must NOT be shown as «Error detectado: Correcto».
 */
function gradeKind(q: ResultQuestion): GradeKind {
  if (q.status !== 'GRADED') return 'pending';
  if (q.isCorrect) return 'correct';
  const hasRealError = !!q.errorTagCode && !CORRECT_CODES.has(q.errorTagCode);
  return hasRealError ? 'error' : 'missing-steps';
}

function scoreLabel(q: ResultQuestion): string {
  if (q.status !== 'GRADED' || q.score === null) return 'Sin corregir';
  return `${q.score} / ${q.points} pts`;
}

function statusChip(q: ResultQuestion): JSX.Element {
  const kind = gradeKind(q);
  if (kind === 'pending') {
    return (
      <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-bold text-[var(--fg-2)]">
        Pendiente
      </span>
    );
  }
  if (kind === 'correct') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--success-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--success-fg)]">
        <CheckCircleIcon size={13} /> Correcto
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--warning-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--warning-fg)]">
      <AlertTriangleIcon size={13} /> {kind === 'missing-steps' ? 'Faltaron pasos' : 'Por mejorar'}
    </span>
  );
}

function ResultRow({ q, showSolution }: { q: ResultQuestion; showSolution: boolean }): JSX.Element {
  const reveal = showSolution && q.solution !== null;
  const kind = gradeKind(q);
  const checkpointSteps = q.solution?.stepsJson.steps.filter((s) => s.checkpoint) ?? [];
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--fg-1)]">
            {q.label ?? `Pregunta ${q.sequence + 1}`}
          </p>
          <p className="mt-0.5 text-xs text-[var(--fg-2)]">{scoreLabel(q)}</p>
        </div>
        {statusChip(q)}
      </div>

      {kind === 'error' ? (
        <p className="mt-3 rounded-xl bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
          Error detectado:{' '}
          <span className="font-semibold">
            {q.errorTagName ?? (q.errorTagCode ? formatHumanName(q.errorTagCode) : 'por revisar')}
          </span>
          .
        </p>
      ) : null}

      {kind === 'missing-steps' ? (
        <div className="mt-3 rounded-xl bg-[var(--warning-bg)] px-3 py-2.5 text-sm text-[var(--warning-fg)]">
          <p>
            Tu resultado es correcto, pero te faltó mostrar el desarrollo. Para el puntaje completo,
            muestra el paso a paso.
          </p>
          {reveal && checkpointSteps.length > 0 ? (
            <>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--warning-fg)]">
                Pasos que pedía la pauta
              </p>
              <ol className="mt-1.5 flex flex-col gap-1.5">
                {checkpointSteps.map((step) => (
                  <li key={step.idx} className="flex flex-col gap-0.5">
                    <Latex>{step.latex}</Latex>
                    {step.explanation_es ? (
                      <span className="text-xs text-[var(--warning-fg)]/80">{step.explanation_es}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </div>
      ) : null}

      {reveal && q.solution ? (
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-3)]">Solución</p>
          <ol className="mt-2 flex flex-col gap-2">
            {q.solution.stepsJson.steps.map((step) => (
              <li key={step.idx} className="flex flex-col gap-1">
                <Latex>{step.latex}</Latex>
                {step.explanation_es ? (
                  <span className="text-xs text-[var(--fg-2)]">{step.explanation_es}</span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm font-bold text-[var(--fg-1)]">
            Respuesta: <Latex>{q.solution.finalAnswer}</Latex>
          </p>
        </div>
      ) : null}
    </Card>
  );
}

async function StudentGuideResults({ guideId }: { guideId: string }): Promise<JSX.Element> {
  const api = getServerApi();
  const results = await api.getGuideResults(guideId);

  if (!results.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState
          kind="error"
          title="No pudimos cargar tu resumen"
          action={
            <Link href={`/guides/${guideId}`} className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
              ← Volver a la guía
            </Link>
          }
        />
      </div>
    );
  }

  const { questions, showSolution } = results.data;
  const graded = questions.filter((q) => q.status === 'GRADED');
  const correct = graded.filter((q) => q.isCorrect).length;
  const totalScore = graded.reduce((acc, q) => acc + (q.score ?? 0), 0);
  const maxScore = questions.reduce((acc, q) => acc + q.points, 0);

  return (
    <div className="mx-auto max-w-[640px]" data-testid="guide-results-root">
      <Link
        href={`/guides/${guideId}`}
        className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
      >
        ← Volver a la guía
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg-1)]">Mi resumen</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard
          label="Correctas"
          value={correct}
          of={questions.length}
          valueClass="text-[var(--success-fg)]"
        />
        <StatCard
          label="Puntaje"
          value={totalScore}
          of={maxScore}
          valueClass="text-[var(--primary)]"
        />
        <StatCard label="Corregidas" value={graded.length} of={questions.length} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {questions.map((q) => (
          <ResultRow key={q.questionId} q={q} showSolution={showSolution} />
        ))}
      </div>

      {!showSolution ? (
        <p className="mt-4 text-center text-xs text-[var(--fg-3)]">
          Tu profe aún no habilitó ver las soluciones.
        </p>
      ) : null}
    </div>
  );
}

export default async function GuideResultsPage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const role = await getCurrentRole();
  return role === 'teacher' ? (
    <TeacherResultsMatrix guideId={guideId} />
  ) : (
    <StudentGuideResults guideId={guideId} />
  );
}
