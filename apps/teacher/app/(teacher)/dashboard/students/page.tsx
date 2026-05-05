'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@components/DashboardLayout'
import { createApiClient } from '@components/api-client'
import { getAccessToken } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { useFirstClassroomId } from '@lib/use-classroom'
import type { StudentMastery } from '@lib/types'

function getMasteryColor(p: number): string {
  if (p >= 0.7) return 'var(--mastery-strong)'
  if (p >= 0.4) return 'var(--mastery-medium)'
  return 'var(--mastery-weak)'
}

function getMasteryLabel(p: number): string {
  if (p >= 0.7) return 'Dominado'
  if (p >= 0.4) return 'En proceso'
  return 'En riesgo'
}

function getMasteryPillClass(p: number): string {
  if (p >= 0.7) return 'status-pill pill-resolved'
  if (p >= 0.4) return 'status-pill pill-processing'
  return 'status-pill pill-at-risk'
}

export default function StudentsPage(): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: runtimeConfig.apiUrl, getAccessToken }),
    [runtimeConfig.apiUrl],
  )
  const { classroomId, loading: classroomLoading, error: classroomError } = useFirstClassroomId(apiClient)
  const [students, setStudents] = useState<StudentMastery[]>([])
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (classroomLoading || !classroomId) return

    async function loadStudents(): Promise<void> {
      try {
        setStudents(await apiClient.getClassroomMastery(classroomId as string))
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar alumnos')
      }
    }

    void loadStudents()
  }, [apiClient, classroomId, classroomLoading])

  const filtered = students.filter((student) =>
    student.studentName.toLowerCase().includes(search.toLowerCase()),
  )

  const error = classroomError || loadError

  return (
    <DashboardLayout unresolvedAlertCount={0}>
      <div className="page-section">
        <div className="page-section-head">
          <h2>Alumnos</h2>
          <input
            type="search"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
          />
        </div>

        {error ? (
          <p style={{ color: 'var(--mastery-weak)', fontSize: 'var(--text-body-sm)' }}>{error}</p>
        ) : null}

        {!error && !classroomId && !classroomLoading ? (
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)' }}>
            No tienes un classroom asignado. Crea uno desde el dashboard principal.
          </p>
        ) : null}

        {classroomLoading ? (
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)' }}>Cargando...</p>
        ) : null}

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
                  student.skills.reduce((sum, skill) => sum + skill.pKnown, 0) / Math.max(student.skills.length, 1)
                const totalAttempts = student.skills.reduce((sum, skill) => sum + skill.attemptsCount, 0)
                const color = getMasteryColor(avgMastery)
                const label = getMasteryLabel(avgMastery)
                const pillClass = getMasteryPillClass(avgMastery)

                return (
                  <tr key={student.studentId}>
                    <td style={{ fontWeight: 'var(--fw-medium)' }}>{student.studentName}</td>
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
                      <Link href={`/dashboard/students/${student.studentId}`} className="student-link">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
