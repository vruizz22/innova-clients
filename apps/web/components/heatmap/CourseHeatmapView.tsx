'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@innova/ui';
import type { CourseHeatmap, HeatmapStudent } from '@innova/api-client';
import { masteryLevel, MASTERY_CELL_BG } from '@/lib/mastery-color';
import { MasteryLegend } from '@/components/heatmap/MasteryLegend';

export interface CourseHeatmapViewProps {
  readonly courseId: string;
  readonly heatmap: CourseHeatmap;
  readonly courseName?: string | null;
}

export function CourseHeatmapView({ courseId, heatmap, courseName }: CourseHeatmapViewProps): JSX.Element {
  const { units, students } = heatmap;
  const [expanded, setExpanded] = useState<string | null>(null);

  const unitName = (unitId: string): string => units.find((u) => u.id === unitId)?.code ?? '—';

  return (
    <div className="mx-auto max-w-[1200px]" data-testid="course-heatmap-root">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
      >
        ← Mis cursos
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg-1)]">
        {courseName ?? 'Dominio del curso'}
      </h1>
      <p className="mt-1 text-sm text-[var(--fg-2)]">
        {students.length} {students.length === 1 ? 'alumno' : 'alumnos'} · {units.length} {units.length === 1 ? 'unidad' : 'unidades'}
      </p>
      <MasteryLegend className="mt-3" />

      <div className="mt-4 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[var(--surface-2)] px-3 py-2 text-left text-xs font-bold text-[var(--fg-2)]">
                Alumno
              </th>
              {units.map((u) => (
                <th
                  key={u.id}
                  className="px-2 py-2 text-center text-xs font-bold text-[var(--fg-2)]"
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
                onToggle={() => setExpanded((e) => (e === st.studentId ? null : st.studentId))}
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
      <tr className="border-t border-[var(--border)]">
        <td className="sticky left-0 z-10 bg-[var(--surface)] px-3 py-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex max-w-[180px] items-center gap-1.5 truncate text-left font-medium text-[var(--fg-1)] hover:text-[var(--primary)]"
          >
            <ChevronRightIcon
              size={14}
              className={[
                'shrink-0 text-[var(--fg-3)] transition-transform duration-[var(--dur-fast)] ease-[var(--ease-standard)]',
                expanded ? 'rotate-90' : '',
              ].join(' ')}
            />
            <span className="truncate">{student.displayName}</span>
          </button>
        </td>
        {units.map((u) => {
          const cell = cellByUnit.get(u.id);
          if (!cell || cell.topicCount === 0) {
            return (
              <td key={u.id} className="px-1 py-1 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-2)] text-xs text-[var(--fg-3)]">
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
                  'mx-auto flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold tabular-nums',
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
        <tr className="bg-[var(--surface-2)]/60">
          <td colSpan={units.length + 1} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-3)]">
                Detalle por tema
              </p>
              <Link
                href={`/courses/${courseId}/students/${student.studentId}`}
                className="text-xs font-medium text-[var(--primary)] hover:underline"
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
