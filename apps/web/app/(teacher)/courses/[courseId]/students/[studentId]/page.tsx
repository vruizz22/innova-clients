import Link from 'next/link';
import { Card, EmptyState } from '@innova/ui';
import { formatHumanName } from '@innova/error-catalog';
import { getServerApi } from '@/lib/api.server';
import { masteryLevel, MASTERY_SOFT_BG, MASTERY_LABEL } from '@/lib/mastery-color';
import { AttemptDetailPanel } from './attempt-detail.client';
import { AssignRecommendButton } from '@/components/teacher/AssignRecommendButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly courseId: string; readonly studentId: string };
}

export default async function StudentDrilldownPage({ params }: PageProps): Promise<JSX.Element> {
  const courseId = decodeURIComponent(params.courseId);
  const studentId = decodeURIComponent(params.studentId);
  const api = getServerApi();

  const [mastery, recommend] = await Promise.all([
    api.getClassroomMastery(courseId),
    api.recommendNextExercise(courseId, studentId),
  ]);

  const student = mastery.ok ? mastery.data.find((s) => s.studentId === studentId) : undefined;

  if (!mastery.ok || !student) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState
          kind="error"
          title="No pudimos cargar al alumno"
          action={
            <Link
              href={`/courses/${courseId}/heatmap`}
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              ← Volver al heatmap
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px]" data-testid="student-drilldown-root">
      <Link
        href={`/courses/${courseId}/heatmap`}
        className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
      >
        ← Heatmap del curso
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg-1)]">
        {student.displayName}
      </h1>

      {/* ── dominio por tema ─────────────────────────────────────────────── */}
      <h2 className="mb-3 mt-6 text-sm font-bold text-[var(--fg-1)]">Dominio por tema</h2>
      <div className="flex flex-col gap-2">
        {student.topics.map((t) => {
          const lvl = masteryLevel(t.pKnown);
          return (
            <Card key={t.topicCode}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--fg-1)]">{t.topicName}</p>
                  <p className="text-xs text-[var(--fg-3)]">{t.attemptsCount} intentos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className={
                        lvl === 'high'
                          ? 'h-full bg-mastery-strong'
                          : lvl === 'mid'
                            ? 'h-full bg-mastery-medium'
                            : 'h-full bg-mastery-weak'
                      }
                      style={{ width: `${Math.round(t.pKnown * 100)}%` }}
                    />
                  </div>
                  <span
                    className={[
                      'w-12 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold',
                      MASTERY_SOFT_BG[lvl],
                    ].join(' ')}
                  >
                    {Math.round(t.pKnown * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── errores frecuentes ───────────────────────────────────────────── */}
      <h2 className="mb-3 mt-8 text-sm font-bold text-[var(--fg-1)]">Errores frecuentes</h2>
      {student.errorFrequency.length === 0 ? (
        <EmptyState kind="no-data" title="Sin errores registrados todavía." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {student.errorFrequency.map((e) => (
            <span
              key={e.errorTagCode}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--warning-fg)]"
            >
              {e.errorTagName ?? formatHumanName(e.errorTagCode)}
              <span className="tabular-nums rounded-full bg-[var(--warning-fg)]/15 px-1.5 text-[10px] font-bold text-[var(--warning-fg)]">
                {Math.round(e.percentage * 100)}%
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ── próximo ejercicio recomendado (IRT Fisher-info) ──────────────── */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-[var(--fg-1)]">Próximo ejercicio recomendado</h2>
          <span className="rounded-full bg-[var(--info-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--info-fg)]">
            IRT · Fisher-info
          </span>
        </div>

        {recommend.ok ? (
          <>
            <div className="mt-3 flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
              <div className="min-w-0 flex-1">
                <p className="math text-base font-black text-[var(--fg-1)]">
                  {recommend.data.exercise.problem}
                </p>
                <p className="mt-1 text-xs text-[var(--fg-2)]">
                  {recommend.data.exercise.topicName}
                </p>
                <p className="mt-2 font-mono text-[11px] text-[var(--fg-3)]">
                  θ = {recommend.data.studentTheta.toFixed(2)} · a = {recommend.data.exercise.irtA.toFixed(2)} · b = {recommend.data.exercise.irtB.toFixed(2)}
                </p>
              </div>
              <AssignRecommendButton
                studentId={studentId}
                exerciseId={recommend.data.exercise.id}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--fg-3)]">{recommend.data.reasoning}</p>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--fg-3)]">
            Sin ejercicios disponibles para este alumno — puede que no tenga dominios con datos de
            dominio aún o que haya completado todos recientemente.
          </p>
        )}
      </div>

      {/* ── últimos intentos ─────────────────────────────────────────────── */}
      <h2 className="mb-3 mt-8 text-sm font-bold text-[var(--fg-1)]">Últimos intentos</h2>
      <AttemptDetailPanel
        attempts={student.attempts.slice(0, 12).map((a) => ({
          id: a.id,
          exercisePrompt: a.exercisePrompt,
          isCorrect: a.isCorrect,
          errorTagCode: a.errorTagCode,
          errorTagName: a.errorTagName ?? null,
        }))}
      />

      <p className="mt-4 text-[11px] text-[var(--fg-3)]">
        {MASTERY_LABEL.high} ≥70% · {MASTERY_LABEL.mid} 40–70% · {MASTERY_LABEL.low} &lt;40%
      </p>
    </div>
  );
}
