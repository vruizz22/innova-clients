'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CourseHeatmap, HeatmapStudent } from '@innova/api-client';
import { masteryLevel, MASTERY_CELL_BG } from '@/lib/mastery-color';

export interface CourseHeatmapViewProps {
  readonly courseId: string;
  readonly heatmap: CourseHeatmap;
}

/**
 * Student × Unit heatmap (C12) with a per-row drill-down to Student × Topic.
 * 35 × 8 renders comfortably without virtualization; the plan's
 * @tanstack/react-virtual is reserved for when courses grow past that.
 */
export function CourseHeatmapView({ courseId, heatmap }: CourseHeatmapViewProps): JSX.Element {
  const { units, students } = heatmap;
  const [expanded, setExpanded] = useState<string | null>(null);

  const unitName = (unitId: string): string =>
    units.find((u) => u.id === unitId)?.code ?? '—';

  return (
    <div className="mx-auto max-w-[1200px]" data-testid="course-heatmap-root">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          ← Cursos
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Dominio del curso</h1>
      <p className="mt-1 text-sm text-slate-500">
        {students.length} alumnos · {units.length} unidades · verde dominado, amarillo en progreso,
        rojo por reforzar
      </p>

      <div className="mt-4 overflow-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-500">
                Alumno
              </th>
              {units.map((u) => (
                <th
                  key={u.id}
                  className="px-2 py-2 text-center text-xs font-bold text-slate-500"
                  title={u.name}
                >
                  {u.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((st) => (
              <StudentRow
                key={st.studentId}
                courseId={courseId}
                student={st}
                units={units}
                expanded={expanded === st.studentId}
                onToggle={() =>
                  setExpanded((e) => (e === st.studentId ? null : st.studentId))
                }
                unitName={unitName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentRow({
  courseId,
  student,
  units,
  expanded,
  onToggle,
  unitName,
}: {
  courseId: string;
  student: HeatmapStudent;
  units: CourseHeatmap['units'];
  expanded: boolean;
  onToggle: () => void;
  unitName: (unitId: string) => string;
}): JSX.Element {
  const cellByUnit = new Map(student.units.map((u) => [u.unitId, u]));
  return (
    <>
      <tr className="border-t border-slate-100">
        <td className="sticky left-0 z-10 bg-white px-3 py-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex max-w-[180px] items-center gap-1.5 truncate text-left font-medium text-slate-800 hover:text-sky-600"
          >
            <span className="text-xs text-slate-400">{expanded ? '▾' : '▸'}</span>
            <span className="truncate">{student.displayName}</span>
          </button>
        </td>
        {units.map((u) => {
          const cell = cellByUnit.get(u.id);
          if (!cell || cell.topicCount === 0) {
            return (
              <td key={u.id} className="px-1 py-1 text-center">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-300">
                  ·
                </span>
              </td>
            );
          }
          const lvl = masteryLevel(cell.pKnown);
          return (
            <td key={u.id} className="px-1 py-1 text-center">
              <span
                title={`${u.name}: ${Math.round(cell.pKnown * 100)}%`}
                className={[
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold',
                  MASTERY_CELL_BG[lvl],
                ].join(' ')}
              >
                {Math.round(cell.pKnown * 100)}
              </span>
            </td>
          );
        })}
      </tr>
      {expanded ? (
        <tr className="bg-slate-50/60">
          <td colSpan={units.length + 1} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Detalle por tema
              </p>
              <Link
                href={`/courses/${courseId}/students/${student.studentId}`}
                className="text-xs font-medium text-sky-600 hover:underline"
              >
                Ver ficha del alumno →
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {student.topics.map((t) => {
                const lvl = masteryLevel(t.pKnown);
                return (
                  <span
                    key={t.topicId}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      MASTERY_CELL_BG[lvl],
                    ].join(' ')}
                    title={`${unitName(t.unitId)} · ${t.topicName}`}
                  >
                    {t.topicName}
                    <span className="rounded-full bg-black/15 px-1.5 text-[10px]">
                      {Math.round(t.pKnown * 100)}
                    </span>
                  </span>
                );
              })}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
