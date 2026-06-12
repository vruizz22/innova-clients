'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  GradeBandSelector,
  HeatmapCollapsedByUnit,
  type HeatmapStudentRow,
  type HeatmapUnit,
} from '@innova/ui';
import { GRADE_BANDS, formatHumanName, type Grade } from '@innova/error-catalog';
import type { Alert, CourseStudentMastery } from '@innova/api-client';
import { getBrowserApi } from '@/lib/api.client';

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
    for (const t of student.topics) if (!unitMap.has(t.topicCode)) unitMap.set(t.topicCode, t.topicName);
  }
  const units: HeatmapUnit[] = [...unitMap.entries()]
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

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((c) => (
          <button
            key={c.id}
            type="button"
            data-testid="course-card"
            onClick={() => void openCourse(c.id)}
            className={[
              'rounded-xl border bg-white p-5 text-left shadow-card transition',
              c.id === courseId
                ? 'border-sky-500 ring-2 ring-sky-500/30'
                : 'border-slate-100 hover:border-sky-300',
            ].join(' ')}
          >
            <p className="text-base font-bold text-slate-900">{c.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{c.gradeLabel}</p>
          </button>
        ))}
      </div>

      {course ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Dominio por alumno · {course.name}
            </h2>
            <span className="text-xs text-slate-500">Click en una celda para ver sus errores</span>
          </div>

          {alerts.length > 0 ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-bold text-amber-800">
                {alerts.length} alerta{alerts.length === 1 ? '' : 's'} sin resolver
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {alerts.slice(0, 4).map((a) => (
                  <li key={a.id} className="text-xs text-amber-700">
                    <span className="font-semibold">{a.severity}</span> · {a.alertType}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {mastery.kind === 'loading' ? (
            <p className="text-sm text-slate-400">Cargando dominio…</p>
          ) : mastery.kind === 'error' ? (
            <p className="text-sm text-rose-600">No pudimos cargar el dominio de este curso.</p>
          ) : heatmap && heatmap.students.length > 0 ? (
            <div data-testid="classroom-heatmap">
              {courseId ? (
                <div className="mb-2 flex justify-end">
                  <Link
                    href={`/courses/${courseId}/heatmap`}
                    className="text-xs font-medium text-sky-600 hover:underline"
                  >
                    Ver dominio completo (Alumno × Unidad) →
                  </Link>
                </div>
              ) : null}
              <HeatmapCollapsedByUnit
                units={heatmap.units}
                students={heatmap.students}
                onUnitDrillDown={(topicCode, studentId) => setDrill({ studentId, topicCode })}
              />
              {drillStudent ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-800">
                    Errores frecuentes · {drillStudent.displayName}
                  </p>
                  {drillStudent.errorFrequency.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-500">Sin errores registrados aún.</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1">
                      {drillStudent.errorFrequency.slice(0, 5).map((ef) => (
                        <li key={ef.errorTagCode} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{formatHumanName(ef.errorTagCode)}</span>
                          <span className="text-slate-400">
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
            <p className="text-sm text-slate-400">Este curso aún no tiene datos de dominio.</p>
          )}
        </section>
      ) : (
        <p className="mt-8 text-sm text-slate-400">Selecciona un curso para ver su heatmap.</p>
      )}
    </div>
  );
}
