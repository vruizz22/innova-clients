'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@components/DashboardLayout';
import { mockStudents } from '@lib/mock-data';

function getMasteryColor(p: number): string {
  if (p >= 0.7) return 'var(--mastery-strong)';
  if (p >= 0.4) return 'var(--mastery-medium)';
  return 'var(--mastery-weak)';
}

function getMasteryLabel(p: number): string {
  if (p >= 0.7) return 'Dominado';
  if (p >= 0.4) return 'En proceso';
  return 'En riesgo';
}

function getMasteryPillClass(p: number): string {
  if (p >= 0.7) return 'status-pill pill-resolved';
  if (p >= 0.4) return 'status-pill pill-processing';
  return 'status-pill pill-at-risk';
}

export default function StudentsPage(): JSX.Element {
  const [search, setSearch] = useState('');

  const filtered = mockStudents.filter((s) =>
    s.studentName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout unresolvedAlertCount={0}>
      <div className="page-section">
        <div className="page-section-head">
          <h2>Alumnos</h2>
          <input
            type="search"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Dominio promedio</th>
                <th>Estado</th>
                <th>Ejercicios</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const avgMastery =
                  student.skills.reduce((sum, s) => sum + s.pKnown, 0) / student.skills.length;
                const totalAttempts = student.skills.reduce((sum, s) => sum + s.attemptsCount, 0);
                const color = getMasteryColor(avgMastery);
                const label = getMasteryLabel(avgMastery);
                const pillClass = getMasteryPillClass(avgMastery);

                return (
                  <tr key={student.studentId}>
                    <td style={{ fontWeight: 'var(--fw-medium)' }}>
                      {student.studentName}
                    </td>
                    <td>
                      <div className="mastery-bar-wrap">
                        <div className="mastery-bar-track">
                          <div
                            className="mastery-bar-fill"
                            style={{ width: `${avgMastery * 100}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="mastery-bar-label" style={{ color }}>
                          {Math.round(avgMastery * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={pillClass}>{label}</span>
                    </td>
                    <td style={{ color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>
                      {totalAttempts}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/students/${student.studentId}`}
                        className="student-link"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
