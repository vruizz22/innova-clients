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
      <main className="container">
        <section className="card auth-shell">
          <h1>Dashboard profesores</h1>
          <p>Inicia sesión para cargar datos desde el backend local.</p>
          <a className="auth-submit" href="/login">Ir a login</a>
        </section>
      </main>
    );
  }

  return (
    <DashboardLayout unresolvedAlertCount={alerts.filter(a => !a.resolvedAt).length}>
      {loadError ? <p className="auth-message">{loadError}</p> : null}
      {selectedStudent ? (
        <StudentDetail
          studentId={selectedStudent.studentId}
          studentName={selectedStudent.studentName}
          attempts={mockAttempts[selectedStudent.studentId] ?? []}
          errorFrequency={mockErrorFrequency[selectedStudent.studentId] ?? []}
          onBack={() => setSelectedStudentId(null)}
        />
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--fg-1)' }}>
              Dominio por alumno
            </h2>
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
              <MasteryHeatmap
                students={students}
                onStudentClick={setSelectedStudentId}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--fg-1)' }}>
              Alertas activas
            </h2>
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
