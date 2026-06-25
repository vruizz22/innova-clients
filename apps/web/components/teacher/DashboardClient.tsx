'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  ChevronRightIcon,
  GradeBandSelector,
  HeatmapCollapsedByUnit,
  StatCard,
  type HeatmapStudentRow,
  type HeatmapUnit,
} from '@innova/ui';
import { GRADE_BANDS, formatHumanName, type Grade } from '@innova/error-catalog';
import type { Alert, CourseStudentMastery } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';
import { MasteryLegend } from '@/components/heatmap/MasteryLegend';

/** A serialisable course row produced by the dashboard RSC. */
export interface CourseView {
  readonly id: string;
  readonly name: string;
  readonly grade: Grade | null;
  readonly gradeLabel: string;
  readonly bandCode: string | null;
}

export interface DashboardClientProps {
  readonly courses: readonly CourseView[];
}

type MasteryState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly data: readonly CourseStudentMastery[] }
  | { readonly kind: 'error' };

interface HeatmapModel {
  readonly units: HeatmapUnit[];
  readonly students: HeatmapStudentRow[];
}

function toHeatmap(data: readonly CourseStudentMastery[]): HeatmapModel {
  const unitMap = new Map<string, string>();
  for (const student of data) {
    for (const t of student.topics)
      if (!unitMap.has(t.topicCode)) unitMap.set(t.topicCode, t.topicName);
  }
  const units: HeatmapUnit[] = Array.from(unitMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([code, name_es]) => ({ code, name_es }));
  const students: HeatmapStudentRow[] = data.map((s) => ({
    studentId: s.studentId,
    studentName: s.displayName,
    cells: Object.fromEntries(s.topics.map((t) => [t.topicCode, t.pKnown])),
  }));
  return { units, students };
}

export function DashboardClient({ courses }: DashboardClientProps): JSX.Element {
  const bandsWithCourses = useMemo(
    () => GRADE_BANDS.filter((b) => courses.some((c) => c.bandCode === b.code)),
    [courses]
  );
  const [band, setBand] = useState<string>(bandsWithCourses[0]?.code ?? '');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [mastery, setMastery] = useState<MasteryState>({ kind: 'idle' });
  const [alerts, setAlerts] = useState<readonly Alert[]>([]);
  const [drill, setDrill] = useState<{ studentId: string; topicCode: string } | null>(null);

  const visibleCourses = courses.filter((c) => c.bandCode === band);
  const course = courses.find((c) => c.id === courseId) ?? null;

  const openCourse = useCallback(async (id: string): Promise<void> => {
    setCourseId(id);
    setDrill(null);
    setAlerts([]);
    setMastery({ kind: 'loading' });
    const api = getBrowserApi();
    const [masteryRes, alertsRes] = await Promise.all([
      api.getClassroomMastery(id),
      api.getAlerts(id),
    ]);
    setMastery(masteryRes.ok ? { kind: 'ready', data: masteryRes.data } : { kind: 'error' });
    if (alertsRes.ok) setAlerts(alertsRes.data.filter((a) => !a.resolvedAt));
  }, []);

  const heatmap = useMemo(
    () => (mastery.kind === 'ready' ? toHeatmap(mastery.data) : null),
    [mastery]
  );

  const drillStudent =
    drill && mastery.kind === 'ready'
      ? mastery.data.find((s) => s.studentId === drill.studentId) ?? null
      : null;

  const courseStats = useMemo(() => {
    if (mastery.kind !== 'ready') return null;
    const { data } = mastery;
    if (data.length === 0) return null;
    const avgMastery =
      data.reduce((sum, s) => {
        const sAvg =
          s.topics.length === 0
            ? 0
            : s.topics.reduce((a, t) => a + t.pKnown, 0) / s.topics.length;
        return sum + sAvg;
      }, 0) / data.length;
    const atRisk = data.filter((s) => s.topics.some((t) => t.pKnown < 0.4)).length;
    return { avgMastery, atRisk, total: data.length };
  }, [mastery]);

  return (
    <div>
      <div className="mt-4 flex justify-end">
        <GradeBandSelector
          value={band}
          onChange={(c) => {
            setBand(c);
            setCourseId(null);
            setMastery({ kind: 'idle' });
            setDrill(null);
          }}
          bands={bandsWithCourses}
        />
      </div>

      <div className="sp-stagger mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((c) => (
          <button
            key={c.id}
            type="button"
            data-testid="course-card"
            onClick={() => void openCourse(c.id)}
            className={[
              'sp-lift rounded-xl border bg-[var(--surface)] p-5 text-left shadow-card transition',
              c.id === courseId
                ? 'border-[var(--primary)] ring-2 ring-[color:var(--primary)]/30'
                : 'border-[var(--border)] hover:border-[var(--primary)]',
            ].join(' ')}
          >
            <p className="text-base font-bold text-[var(--fg-1)]">{c.name}</p>
            <p className="mt-0.5 text-xs text-[var(--fg-2)]">{c.gradeLabel}</p>
          </button>
        ))}
      </div>

      {course ? (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--fg-1)]">
              Dominio por alumno · {course.name}
            </h2>
            <span className="text-xs text-[var(--fg-2)]">Toca una celda para ver sus errores</span>
          </div>
          {/* Stat row: rendered when mastery is loading (skeleton) or ready */}
          {mastery.kind === 'loading' || courseStats ? (
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Mastery promedio"
                value={courseStats ? `${Math.round(courseStats.avgMastery * 100)}%` : undefined}
                pending={mastery.kind === 'loading'}
                valueClass={
                  courseStats
                    ? courseStats.avgMastery >= 0.7
                      ? 'text-mastery-strong'
                      : courseStats.avgMastery >= 0.4
                        ? 'text-mastery-medium'
                        : 'text-mastery-weak'
                    : 'text-[var(--fg-1)]'
                }
              />
              <StatCard
                label="En riesgo"
                value={courseStats?.atRisk}
                of={courseStats?.total}
                pending={mastery.kind === 'loading'}
                valueClass={
                  courseStats && courseStats.atRisk > 0
                    ? 'text-[var(--warning-fg)]'
                    : 'text-[var(--fg-1)]'
                }
                description="temas < 40%"
              />
              <StatCard
                label="Alertas"
                value={alerts.length}
                pending={mastery.kind === 'loading'}
                valueClass={
                  alerts.length > 0 ? 'text-[var(--error-fg)]' : 'text-[var(--fg-1)]'
                }
                description="sin resolver"
              />
              <StatCard
                label="Alumnos"
                value={courseStats?.total}
                pending={mastery.kind === 'loading'}
              />
            </div>
          ) : null}

          <MasteryLegend className="mb-4" />

          {alerts.length > 0 ? (
            <div className="mb-4 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] p-3">
              <p className="text-sm font-bold text-[var(--error-fg)]">
                {alerts.length} alerta{alerts.length === 1 ? '' : 's'} sin resolver
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {alerts.slice(0, 4).map((a) => (
                  <li key={a.id} className="text-xs text-[var(--error-fg)]">
                    <span className="font-semibold">{a.severity}</span> · {a.alertType}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {mastery.kind === 'loading' ? (
            <p className="text-sm text-[var(--fg-3)]">Cargando dominio…</p>
          ) : mastery.kind === 'error' ? (
            <p className="text-sm text-danger">No pudimos cargar el dominio de este curso.</p>
          ) : heatmap && heatmap.students.length > 0 ? (
            <div data-testid="classroom-heatmap" className="sp-rise">
              {courseId ? (
                <div className="mb-3 flex justify-end">
                  <Link
                    href={`/courses/${courseId}/heatmap`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg-1)] shadow-card transition-[transform,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.98]"
                  >
                    Ver dominio completo · Alumno × Unidad
                    <ChevronRightIcon size={16} className="text-[var(--fg-3)]" />
                  </Link>
                </div>
              ) : null}
              <HeatmapCollapsedByUnit
                units={heatmap.units}
                students={heatmap.students}
                onUnitDrillDown={(topicCode, studentId) => setDrill({ studentId, topicCode })}
              />
              {drillStudent ? (
                <div className="sp-rise mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-bold text-[var(--fg-1)]">
                    Errores frecuentes · {drillStudent.displayName}
                  </p>
                  {drillStudent.errorFrequency.length === 0 ? (
                    <p className="mt-1 text-sm text-[var(--fg-2)]">Sin errores registrados aún.</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1">
                      {drillStudent.errorFrequency.slice(0, 5).map((ef) => (
                        <li
                          key={ef.errorTagCode}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-[var(--fg-1)]">
                            {ef.errorTagName ?? formatHumanName(ef.errorTagCode)}
                          </span>
                          <span className="text-[var(--fg-3)]">
                            {ef.count} · {Math.round(ef.percentage)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[var(--fg-3)]">Este curso aún no tiene datos de dominio.</p>
          )}
        </section>
      ) : (
        <p className="mt-8 text-sm text-[var(--fg-3)]">Selecciona un curso para ver su heatmap.</p>
      )}
    </div>
  );
}
