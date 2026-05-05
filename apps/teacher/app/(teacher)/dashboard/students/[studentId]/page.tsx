'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@components/DashboardLayout'
import { StudentDetail } from '@components/StudentDetail'
import { createApiClient } from '@components/api-client'
import { getAccessToken } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { useFirstClassroomId } from '@lib/use-classroom'
import type { StudentMastery } from '@lib/types'

interface PageProps {
  params: { studentId: string }
}

export default function StudentDetailPage({ params }: PageProps): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: runtimeConfig.apiUrl, getAccessToken }),
    [runtimeConfig.apiUrl],
  )
  const { classroomId, loading: classroomLoading, error: classroomError } = useFirstClassroomId(apiClient)
  const [student, setStudent] = useState<StudentMastery | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (classroomLoading || !classroomId) return

    async function loadStudent(): Promise<void> {
      try {
        const students = await apiClient.getClassroomMastery(classroomId as string)
        setStudent(students.find((item) => item.studentId === params.studentId) ?? null)
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el alumno')
      }
    }

    void loadStudent()
  }, [apiClient, classroomId, classroomLoading, params.studentId])

  const error = classroomError || loadError

  if (error) {
    return (
      <DashboardLayout unresolvedAlertCount={0}>
        <div className="card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <p style={{ color: 'var(--mastery-weak)' }}>{error}</p>
          <a href="/dashboard/students" className="btn btn-ghost" style={{ marginTop: 'var(--sp-4)', textDecoration: 'none' }}>
            Volver a alumnos
          </a>
        </div>
      </DashboardLayout>
    )
  }

  if (!student) {
    return (
      <DashboardLayout unresolvedAlertCount={0}>
        <div className="card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <p style={{ color: 'var(--fg-2)' }}>Cargando alumno...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout unresolvedAlertCount={0}>
      <StudentDetail
        studentId={student.studentId}
        studentName={student.studentName}
        attempts={student.attempts ?? []}
        errorFrequency={student.errorFrequency ?? []}
        onBack={() => {
          window.location.href = '/dashboard/students'
        }}
      />
    </DashboardLayout>
  )
}
