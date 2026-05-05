'use client';

import type { StudentMastery } from '@lib/types';

interface MasteryHeatmapProps {
  students: StudentMastery[];
  onStudentClick?: (studentId: string) => void;
}

function getMasteryClass(pKnown: number): string {
  if (pKnown >= 0.7) return 'mastery-strong';
  if (pKnown >= 0.4) return 'mastery-medium';
  return 'mastery-weak';
}

function formatPct(pKnown: number): string {
  return `${Math.round(pKnown * 100)}%`;
}

// Derive unique skill columns from the first student (all share the same skills)
function getSkillColumns(students: StudentMastery[]): Array<{ skillKey: string; skillLabel: string }> {
  const first = students[0];
  if (!first) return [];
  return first.skills.map(s => ({ skillKey: s.skillKey, skillLabel: s.skillLabel }));
}

// Short label: trim long skill labels for column headers
function shortLabel(label: string): string {
  return label.length > 14 ? label.slice(0, 13) + '…' : label;
}

export function MasteryHeatmap({ students, onStudentClick }: MasteryHeatmapProps): JSX.Element {
  const skillColumns = getSkillColumns(students);

  return (
    <div className="t-heatmap" data-testid="mastery-heatmap" role="region" aria-label="Mapa de dominio por alumno">
      <table aria-label="Dominio por alumno y habilidad">
        <thead>
          <tr>
            <th scope="col" aria-label="Alumno" style={{ minWidth: 100 }}></th>
            {skillColumns.map(sk => (
              <th
                key={sk.skillKey}
                scope="col"
                className="t-heat-skill"
                title={sk.skillLabel}
              >
                <span>{shortLabel(sk.skillLabel)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.studentId}>
              <td className="t-heat-name" scope="row">
                <button
                  onClick={() => onStudentClick?.(student.studentId)}
                  className="btn-ghost"
                  style={{
                    padding: '4px 8px',
                    fontWeight: 600,
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--fg-1)',
                    border: 0,
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    background: 'transparent',
                    textAlign: 'left',
                    minHeight: 0,
                  }}
                  data-testid={`student-name-btn-${student.studentId}`}
                  aria-label={`Ver detalle de ${student.studentName}`}
                >
                  {student.studentName}
                </button>
              </td>
              {student.skills.map(skill => {
                const masteryClass = getMasteryClass(skill.pKnown);
                const pct = formatPct(skill.pKnown);
                return (
                  <td
                    key={skill.skillKey}
                    style={{ textAlign: 'center', padding: '4px' }}
                  >
                    <div
                      className={`mastery-cell ${masteryClass}`}
                      data-testid="mastery-cell"
                      data-p-known={skill.pKnown}
                      data-student-id={student.studentId}
                      data-skill-key={skill.skillKey}
                      title={`${student.studentName} · ${skill.skillLabel} · ${pct}`}
                      role="img"
                      aria-label={`${student.studentName} · ${skill.skillLabel}: ${pct}`}
                    >
                      {pct}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div
        role="note"
        aria-label="Leyenda de colores de dominio"
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        {([
          { cls: 'mastery-strong', label: 'Dominado (≥70%)'       },
          { cls: 'mastery-medium', label: 'En progreso (40–69%)'   },
          { cls: 'mastery-weak',   label: 'En riesgo (<40%)'       },
        ] as const).map(({ cls, label }) => (
          <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`mastery-cell ${cls}`} style={{ width: 20, height: 20, fontSize: 10, borderRadius: 4 }} aria-hidden="true" />
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--fg-2)', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
