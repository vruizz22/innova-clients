'use client';

import React from 'react';

export interface HeatmapUnit {
  code: string;
  name_es: string;
}

export interface HeatmapStudentRow {
  studentId: string;
  studentName: string;
  /** p_known average per unit code (0–1). Missing = no data. */
  cells: Record<string, number | undefined>;
}

interface HeatmapCollapsedByUnitProps {
  units: HeatmapUnit[];
  students: HeatmapStudentRow[];
  onUnitDrillDown?: (unitCode: string, studentId: string) => void;
  className?: string;
}

function masteryClass(p: number | undefined): string {
  if (p === undefined) return 'bg-[#F7F8FA] text-[#A5ADBC]';
  if (p >= 0.7) return 'bg-[rgba(61,170,114,0.18)] text-[#226B47]';
  if (p >= 0.4) return 'bg-[rgba(232,163,61,0.20)] text-[#7A4F00]';
  return 'bg-[rgba(216,96,96,0.18)] text-[#7a1a1a]';
}

/**
 * Student × Unit heatmap (v8 C2.3). Default teacher view collapses 200+ topics
 * to units; clicking a cell drills down to that unit's topics.
 */
export function HeatmapCollapsedByUnit({
  units,
  students,
  onUnitDrillDown,
  className = '',
}: HeatmapCollapsedByUnitProps): JSX.Element {
  return (
    <div
      className={['overflow-auto rounded-xl border border-[#E5E9F0] bg-white p-4 shadow-card', className]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-label="Mapa de dominio por alumno y unidad"
    >
      <table className="border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="min-w-[120px]" />
            {units.map((u) => (
              <th key={u.code} className="px-1 pb-2 align-bottom" title={u.name_es}>
                <span className="block max-w-[88px] truncate text-[11px] font-semibold text-[#4F5868]">
                  {u.name_es}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((row) => (
            <tr key={row.studentId}>
              <td className="pr-3 text-right text-sm font-semibold text-[#1F2937]">
                {row.studentName}
              </td>
              {units.map((u) => {
                const p = row.cells[u.code];
                return (
                  <td key={u.code} className="p-0.5 text-center">
                    <button
                      type="button"
                      disabled={!onUnitDrillDown}
                      onClick={() => onUnitDrillDown?.(u.code, row.studentId)}
                      title={`${row.studentName} · ${u.name_es} · ${p === undefined ? 's/d' : `${Math.round(p * 100)}%`}`}
                      className={[
                        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-[outline]',
                        masteryClass(p),
                        onUnitDrillDown ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-[#3FA7D6]' : '',
                      ].join(' ')}
                    >
                      {p === undefined ? '–' : Math.round(p * 100)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-4 border-t border-[#E5E9F0] pt-3 text-[11px] text-[#4F5868]">
        {[
          { c: 'bg-[rgba(61,170,114,0.18)]', l: 'Dominado (≥70%)' },
          { c: 'bg-[rgba(232,163,61,0.20)]', l: 'En proceso (40–69%)' },
          { c: 'bg-[rgba(216,96,96,0.18)]', l: 'En riesgo (<40%)' },
        ].map((it) => (
          <span key={it.l} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-3.5 w-3.5 rounded ${it.c}`} aria-hidden />
            {it.l}
          </span>
        ))}
      </div>
    </div>
  );
}
