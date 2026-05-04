'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@components/DashboardLayout';
import { mockStudents } from '@lib/mock-data';

function getMasteryColor(p: number): string {
  if (p >= 0.7) return '#3DAA72';
  if (p >= 0.4) return '#E8A33D';
  return '#D86060';
}

function getMasteryLabel(p: number): string {
  if (p >= 0.7) return 'Dominado';
  if (p >= 0.4) return 'En proceso';
  return 'En riesgo';
}

export default function StudentsPage(): JSX.Element {
  const [search, setSearch] = useState('');

  const filtered = mockStudents.filter((s) =>
    s.studentName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout unresolvedAlertCount={0}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--fg-1)' }}>
            Alumnos
          </h2>
          <input
            type="search"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[#CDD3DD] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA7D6]"
          />
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E9F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E9F0] bg-[#F7F8FA]">
                <th className="text-left px-4 py-3 font-semibold text-[#4F5868]">Alumno</th>
                <th className="text-left px-4 py-3 font-semibold text-[#4F5868]">Dominio promedio</th>
                <th className="text-left px-4 py-3 font-semibold text-[#4F5868]">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-[#4F5868]">Ejercicios</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const avgMastery =
                  student.skills.reduce((sum, s) => sum + s.pKnown, 0) / student.skills.length;
                const totalAttempts = student.skills.reduce((sum, s) => sum + s.attemptsCount, 0);
                const color = getMasteryColor(avgMastery);
                const label = getMasteryLabel(avgMastery);

                return (
                  <tr
                    key={student.studentId}
                    className="border-b border-[#E5E9F0] hover:bg-[#F7F8FA] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#1F2937]">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-[#E5E9F0] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${avgMastery * 100}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-xs font-semibold" style={{ color }}>
                          {Math.round(avgMastery * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${color}20`,
                          color,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4F5868]">{totalAttempts}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/students/${student.studentId}`}
                        className="text-xs font-semibold text-[#3FA7D6] hover:text-[#2F8DBA] transition-colors"
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
