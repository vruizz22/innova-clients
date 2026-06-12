import Link from 'next/link';
import { Card } from '@innova/ui';
import { formatHumanName } from '@innova/error-catalog';
import type { GuideResults } from '@innova/api-client';
import { getServerApi } from '@/lib/api.server';
import { Latex } from '@/components/latex/Latex';

// Server Component: the student's self-only results for a graded guide.
// Solutions are revealed only when the teacher enabled `showSolution`.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly guideId: string };
}

type ResultQuestion = GuideResults['questions'][number];

function scoreLabel(q: ResultQuestion): string {
  if (q.status !== 'GRADED' || q.score === null) return 'Sin corregir';
  return `${q.score} / ${q.points} pts`;
}

function statusChip(q: ResultQuestion): JSX.Element {
  if (q.status !== 'GRADED') {
    return (
      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
        Pendiente
      </span>
    );
  }
  return q.isCorrect ? (
    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
      ✅ Correcto
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
      💪 Por mejorar
    </span>
  );
}

function ResultRow({ q, showSolution }: { q: ResultQuestion; showSolution: boolean }): JSX.Element {
  const reveal = showSolution && q.solution !== null;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">
            {q.label ?? `Pregunta ${q.sequence + 1}`}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{scoreLabel(q)}</p>
        </div>
        {statusChip(q)}
      </div>

      {q.status === 'GRADED' && !q.isCorrect && q.errorTagCode ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Error detectado: <span className="font-semibold">{formatHumanName(q.errorTagCode)}</span>.
        </p>
      ) : null}

      {reveal && q.solution ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Solución</p>
          <ol className="mt-2 flex flex-col gap-2">
            {q.solution.stepsJson.steps.map((step) => (
              <li key={step.idx} className="flex flex-col gap-1">
                <Latex>{step.latex}</Latex>
                {step.explanation_es ? (
                  <span className="text-xs text-slate-500">{step.explanation_es}</span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm font-bold text-slate-800">
            Respuesta: <Latex>{q.solution.finalAnswer}</Latex>
          </p>
        </div>
      ) : null}
    </Card>
  );
}

export default async function StudentGuideResultsPage({ params }: PageProps): Promise<JSX.Element> {
  const guideId = decodeURIComponent(params.guideId);
  const api = getServerApi();
  const results = await api.getGuideResults(guideId);

  if (!results.ok) {
    return (
      <div className="mx-auto max-w-[640px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar tu resumen</p>
          <Link href={`/guides/${guideId}`} className="mt-3 inline-block text-sm font-medium text-sky-600">
            ← Volver a la guía
          </Link>
        </Card>
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
      <Link href={`/guides/${guideId}`} className="text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Volver a la guía
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Mi resumen</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-xs text-slate-500">Correctas</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {correct}
            <span className="text-base font-bold text-slate-400">/{questions.length}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Puntaje</p>
          <p className="mt-1 text-2xl font-black text-sky-600">
            {totalScore}
            <span className="text-base font-bold text-slate-400">/{maxScore}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Corregidas</p>
          <p className="mt-1 text-2xl font-black text-slate-700">
            {graded.length}
            <span className="text-base font-bold text-slate-400">/{questions.length}</span>
          </p>
        </Card>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {questions.map((q) => (
          <ResultRow key={q.questionId} q={q} showSolution={showSolution} />
        ))}
      </div>

      {!showSolution ? (
        <p className="mt-4 text-center text-xs text-slate-400">
          Tu profe aún no habilitó ver las soluciones.
        </p>
      ) : null}
    </div>
  );
}
