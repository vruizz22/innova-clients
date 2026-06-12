import Link from 'next/link';
import { Card } from '@innova/ui';
import { formatHumanName } from '@innova/error-catalog';
import { getServerApi } from '@/lib/api.server';
import { masteryLevel, MASTERY_SOFT_BG, MASTERY_LABEL } from '@/lib/mastery-color';

// Server Component: per-student drill-down (C12) — mastery by topic, recent
// attempts and frequent errors. Reuses the course mastery payload.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: { readonly courseId: string; readonly studentId: string };
}

export default async function StudentDrilldownPage({ params }: PageProps): Promise<JSX.Element> {
  const courseId = decodeURIComponent(params.courseId);
  const studentId = decodeURIComponent(params.studentId);
  const api = getServerApi();
  const mastery = await api.getClassroomMastery(courseId);

  const student = mastery.ok ? mastery.data.find((s) => s.studentId === studentId) : undefined;

  if (!mastery.ok || !student) {
    return (
      <div className="mx-auto max-w-[640px]">
        <Card>
          <p className="text-sm font-bold text-slate-800">No pudimos cargar al alumno</p>
          <Link
            href={`/courses/${courseId}/heatmap`}
            className="mt-3 inline-block text-sm font-medium text-sky-600"
          >
            ← Volver al heatmap
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px]" data-testid="student-drilldown-root">
      <Link
        href={`/courses/${courseId}/heatmap`}
        className="text-sm font-medium text-sky-600 hover:text-sky-700"
      >
        ← Heatmap del curso
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {student.displayName}
      </h1>

      <h2 className="mb-3 mt-6 text-sm font-bold text-slate-700">Dominio por tema</h2>
      <div className="flex flex-col gap-2">
        {student.topics.map((t) => {
          const lvl = masteryLevel(t.pKnown);
          return (
            <Card key={t.topicCode}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{t.topicName}</p>
                  <p className="text-xs text-slate-400">{t.attemptsCount} intentos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={
                        lvl === 'high'
                          ? 'h-full bg-emerald-500'
                          : lvl === 'mid'
                            ? 'h-full bg-amber-400'
                            : 'h-full bg-rose-500'
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

      <h2 className="mb-3 mt-8 text-sm font-bold text-slate-700">Errores frecuentes</h2>
      {student.errorFrequency.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">Sin errores registrados todavía.</p>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {student.errorFrequency.map((e) => (
            <span
              key={e.errorTagCode}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
            >
              {formatHumanName(e.errorTagCode)}
              <span className="rounded-full bg-rose-200 px-1.5 text-[10px] text-rose-800">
                {Math.round(e.percentage * 100)}%
              </span>
            </span>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-bold text-slate-700">Últimos intentos</h2>
      <div className="flex flex-col gap-2">
        {student.attempts.slice(0, 12).map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm text-slate-700">
                {a.exercisePrompt || 'Ejercicio'}
              </p>
              <span
                className={[
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
                  a.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                ].join(' ')}
              >
                {a.isCorrect ? '✓' : a.errorTagCode ? formatHumanName(a.errorTagCode) : '✗'}
              </span>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{MASTERY_LABEL.high} ≥70% · {MASTERY_LABEL.mid} 40–70% · {MASTERY_LABEL.low} &lt;40%</p>
    </div>
  );
}
