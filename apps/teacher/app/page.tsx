'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@components/DashboardLayout';
import { MasteryHeatmap } from '@components/MasteryHeatmap';
import { AlertsPanel } from '@components/AlertsPanel';
import { StudentDetail } from '@components/StudentDetail';
import type { StudentMastery, TeacherAlert } from '@lib/types';
import { createApiClient, type TeacherAlertRecord } from '@components/api-client';
import { AuthGuard } from '@shared/auth-guard';
import { getAccessToken } from '@shared/auth-session';
import { getPublicRuntimeConfig } from '@shared/runtime-config';

const TEACHER_ROLES = ['teacher', 'admin'] as const;

function mapBackendAlert(alert: TeacherAlertRecord, fallbackClassroomId: string): TeacherAlert {
  return {
    id: alert.id,
    alertType: 'AT_RISK_SKILL',
    classroomId: alert.classroomId ?? fallbackClassroomId,
    payload: {
      skillLabel: alert.message,
      studentIds: alert.studentId ? [alert.studentId] : [],
    },
    createdAt: alert.createdAt,
    resolvedAt: alert.resolved ? alert.updatedAt : null,
  };
}

export default function TeacherDashboard(): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig();
  const classroomId = runtimeConfig.classroomId;
  const apiBaseUrl = runtimeConfig.apiUrl;
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: apiBaseUrl, getAccessToken }),
    [apiBaseUrl],
  );
  const [students, setStudents] = useState<StudentMastery[]>([]);
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadDashboard(): Promise<void> {
      setLoadError('');
      try {
        const [backendAlerts, classroomStudents] = await Promise.all([
          apiClient.listAlerts(classroomId),
          apiClient.getClassroomMastery(classroomId),
        ]);

        setAlerts(backendAlerts.map((alert) => mapBackendAlert(alert, classroomId)));
        setStudents(classroomStudents);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el dashboard');
      }
    }

    void loadDashboard();
  }, [apiClient, classroomId]);

  const handleResolveAlert = (id: string): void => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolvedAt: new Date().toISOString() } : a));
    void apiClient.resolveAlert(id).catch((error) => {
      setLoadError(error instanceof Error ? error.message : 'No se pudo resolver la alerta');
    });
  };

  const selectedStudent = selectedStudentId
    ? students.find(s => s.studentId === selectedStudentId)
    : null;

  return (
    <AuthGuard allowedRoles={TEACHER_ROLES} loginPath="/login">
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
            attempts={selectedStudent.attempts ?? []}
            errorFrequency={selectedStudent.errorFrequency ?? []}
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
    </AuthGuard>
  );
}
