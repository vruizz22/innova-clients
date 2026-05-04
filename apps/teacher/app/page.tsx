'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@components/DashboardLayout';
import { MasteryHeatmap } from '@components/MasteryHeatmap';
import { AlertsPanel } from '@components/AlertsPanel';
import { StudentDetail } from '@components/StudentDetail';
import { mockStudents, mockAttempts, mockErrorFrequency } from '@lib/mock-data';
import type { StudentMastery, TeacherAlert } from '@lib/types';
import { createApiClient, type TeacherAlertRecord } from '@components/api-client';
import { getAccessToken, getStoredSession } from '@shared/auth-session';

const CLASSROOM_ID = process.env.NEXT_PUBLIC_CLASSROOM_ID ?? 'seed-classroom-001';

function mapBackendAlert(alert: TeacherAlertRecord): TeacherAlert {
  return {
    id: alert.id,
    alertType: 'AT_RISK_SKILL',
    classroomId: alert.classroomId ?? CLASSROOM_ID,
    payload: {
      skillLabel: alert.message,
      studentIds: alert.studentId ? [alert.studentId] : [],
    },
    createdAt: alert.createdAt,
    resolvedAt: alert.resolved ? alert.updatedAt : null,
  };
}

export default function TeacherDashboard(): JSX.Element {
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000', []);
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: apiBaseUrl, getAccessToken }),
    [apiBaseUrl],
  );
  const [hasSession, setHasSession] = useState(false);
  const [students, setStudents] = useState<StudentMastery[]>(mockStudents);
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const session = getStoredSession();
    setHasSession(session !== null);

    if (!session) return;

    async function loadDashboard(): Promise<void> {
      setLoadError('');
      try {
        const [backendAlerts, ...masteryByStudent] = await Promise.all([
          apiClient.listAlerts(CLASSROOM_ID),
          ...mockStudents.map((student) => apiClient.getMastery(student.studentId)),
        ]);

        setAlerts(backendAlerts.map(mapBackendAlert));
        setStudents((currentStudents) =>
          currentStudents.map((student, index) => {
            const mastery = masteryByStudent[index] ?? [];
            if (mastery.length === 0) return student;

            return {
              ...student,
              skills: student.skills.map((skill) => {
                const backendSkill = mastery.find((item) => item.skillKey === skill.skillKey);
                return backendSkill ? { ...skill, pKnown: backendSkill.pKnown } : skill;
              }),
            };
          }),
        );
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el dashboard');
      }
    }

    void loadDashboard();
  }, [apiClient]);

  const handleResolveAlert = (id: string): void => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolvedAt: new Date().toISOString() } : a));
    void apiClient.resolveAlert(id).catch((error) => {
      setLoadError(error instanceof Error ? error.message : 'No se pudo resolver la alerta');
    });
  };

  const selectedStudent = selectedStudentId
    ? students.find(s => s.studentId === selectedStudentId)
    : null;

  if (!hasSession) {
    return (
      <main className="container" style={{ maxWidth: 480, margin: '80px auto', padding: 'var(--sp-4)' }}>
        <section className="card">
          <h1 style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-bold)', margin: '0 0 var(--sp-2)' }}>
            Dashboard profesores
          </h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)', margin: '0 0 var(--sp-4)' }}>
            Inicia sesión para cargar datos desde el backend local.
          </p>
          <a className="btn btn-primary" href="/login" style={{ textDecoration: 'none' }}>
            Ir a login
          </a>
        </section>
      </main>
    );
  }

  return (
    <DashboardLayout unresolvedAlertCount={alerts.filter(a => !a.resolvedAt).length}>
      {loadError ? (
        <p style={{ color: 'var(--mastery-weak)', fontSize: 'var(--text-body-sm)', marginBottom: 'var(--sp-4)' }}>
          {loadError}
        </p>
      ) : null}

      {selectedStudent ? (
        <StudentDetail
          studentId={selectedStudent.studentId}
          studentName={selectedStudent.studentName}
          attempts={mockAttempts[selectedStudent.studentId] ?? []}
          errorFrequency={mockErrorFrequency[selectedStudent.studentId] ?? []}
          onBack={() => setSelectedStudentId(null)}
        />
      ) : (
        <div className="dashboard-home">
          <div>
            <div className="t-section-head">
              <h2>Dominio por alumno</h2>
            </div>
            <MasteryHeatmap
              students={students}
              onStudentClick={setSelectedStudentId}
            />
          </div>

          <div>
            <div className="t-section-head">
              <h2>Alertas activas</h2>
              {alerts.filter(a => !a.resolvedAt).length > 0 && (
                <span className="alert-count-badge">
                  {alerts.filter(a => !a.resolvedAt).length} sin resolver
                </span>
              )}
            </div>
            <AlertsPanel
              alerts={alerts.filter(a => !a.resolvedAt)}
              onResolve={handleResolveAlert}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
