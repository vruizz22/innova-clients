'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@components/DashboardLayout';
import { MasteryHeatmap } from '@components/MasteryHeatmap';
import { AlertsPanel } from '@components/AlertsPanel';
import { StudentDetail } from '@components/StudentDetail';
import type { StudentMastery, TeacherAlert } from '@lib/types';
import {
  createApiClient,
  type ClassroomRecord,
  type TeacherAlertRecord,
} from '@components/api-client';
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
  const apiBaseUrl = runtimeConfig.apiUrl;
  const practiceUrl = runtimeConfig.practiceUrl;

  const apiClient = useMemo(
    () => createApiClient({ baseUrl: apiBaseUrl, getAccessToken }),
    [apiBaseUrl],
  );

  const [classroom, setClassroom] = useState<ClassroomRecord | null>(null);
  const [students, setStudents] = useState<StudentMastery[]>([]);
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [dashLoading, setDashLoading] = useState(true);
  const [creatingClassroom, setCreatingClassroom] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [createError, setCreateError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    async function loadDashboard(): Promise<void> {
      setLoadError('');
      setDashLoading(true);
      try {
        const classrooms = await apiClient.getMyClassrooms();

        if (classrooms.length === 0) {
          setClassroom(null);
          setDashLoading(false);
          return;
        }

        const active = classrooms[0];
        setClassroom(active);

        const [backendAlerts, classroomStudents] = await Promise.all([
          apiClient.listAlerts(active.id),
          apiClient.getClassroomMastery(active.id),
        ]);

        setAlerts(backendAlerts.map((alert) => mapBackendAlert(alert, active.id)));
        setStudents(classroomStudents);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el dashboard');
      } finally {
        setDashLoading(false);
      }
    }

    void loadDashboard();
  }, [apiClient]);

  async function handleCreateClassroom(): Promise<void> {
    if (!newClassroomName.trim()) return;
    setCreatingClassroom(true);
    setCreateError('');
    try {
      const created = await apiClient.createClassroom({ name: newClassroomName.trim() });
      setClassroom(created);
      setNewClassroomName('');
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'No se pudo crear el classroom');
    } finally {
      setCreatingClassroom(false);
    }
  }

  async function handleCopyInvite(): Promise<void> {
    if (!classroom) return;
    try {
      const response = await apiClient.createClassroomInvite(classroom.id);
      setInviteUrl(response.url);
      await navigator.clipboard.writeText(response.url);
      setCopyMessage('¡Link copiado al portapapeles!');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (error) {
      setCopyMessage(error instanceof Error ? error.message : 'No se pudo generar el link');
    }
  }

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
        {dashLoading ? (
          <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--fg-3)' }}>
            <p>Cargando dashboard...</p>
          </div>
        ) : null}

        {!dashLoading && loadError ? (
          <div role="alert" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-4)', background: 'var(--mastery-weak-bg, #fef2f2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--mastery-weak)' }}>
            <p style={{ color: 'var(--mastery-weak)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
              No se pudo cargar el dashboard
            </p>
            <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)' }}>{loadError}</p>
          </div>
        ) : null}

        {/* No classrooms yet — create one */}
        {!dashLoading && !loadError && !classroom ? (
          <div style={{ padding: 'var(--sp-8)', maxWidth: 480 }}>
            <h2 style={{ marginBottom: 'var(--sp-4)' }}>Crea tu primer classroom</h2>
            <p style={{ color: 'var(--fg-2)', marginBottom: 'var(--sp-6)' }}>
              Aún no tienes ningún classroom. Crea uno para empezar a invitar alumnos.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexDirection: 'column' }}>
              <input
                type="text"
                placeholder="Nombre del classroom (ej. 4°B Matemáticas)"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                style={{ padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: 'var(--text-body)' }}
              />
              {createError ? (
                <p style={{ color: 'var(--mastery-weak)', fontSize: 'var(--text-body-sm)' }}>{createError}</p>
              ) : null}
              <button
                onClick={handleCreateClassroom}
                disabled={creatingClassroom || !newClassroomName.trim()}
                style={{ padding: 'var(--sp-3) var(--sp-6)', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                {creatingClassroom ? 'Creando...' : 'Crear classroom'}
              </button>
            </div>
          </div>
        ) : null}

        {!dashLoading && !loadError && classroom ? (
          <>
            {/* Classroom header with invite */}
            <div style={{ padding: 'var(--sp-4) 0 var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--fg-3)', marginBottom: 2 }}>Mi Classroom</p>
                <h2 style={{ margin: 0 }}>{classroom.name}</h2>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-2)' }}>
                <button
                  onClick={handleCopyInvite}
                  style={{ padding: 'var(--sp-2) var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-body-sm)' }}
                >
                  Copiar link de invitación
                </button>
                {copyMessage ? (
                  <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--fg-2)' }}>{copyMessage}</span>
                ) : null}
                {inviteUrl ? (
                  <input
                    readOnly
                    value={inviteUrl}
                    style={{ fontSize: 'var(--text-body-sm)', padding: 'var(--sp-1) var(--sp-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 300 }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                ) : null}
              </div>
            </div>

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
          </>
        ) : null}
      </DashboardLayout>
    </AuthGuard>
  );
}
