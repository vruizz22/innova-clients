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

  const [currentUser, setCurrentUser] = useState<{ email: string; id: string } | null>(null);
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
        const [meResult, classrooms] = await Promise.all([
          apiClient.me().catch(() => null),
          apiClient.getMyClassrooms(),
        ]);
        if (meResult?.user) {
          setCurrentUser({ email: meResult.user.email, id: meResult.user.id });
        }

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
      <DashboardLayout unresolvedAlertCount={alerts.filter(a => !a.resolvedAt).length} userEmail={currentUser?.email}>
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
            {/* Page header */}
            <div className="t-page-head">
              <div>
                <h1>Buenas tardes, {currentUser?.email?.split('@')[0] ?? 'Profesor/a'}</h1>
                <p>Vista general del curso · {classroom.name} · {students.length} alumnos</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={handleCopyInvite}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-body-sm)' }}
                >
                  Copiar link de invitación
                </button>
                <button className="btn btn-primary">Asignar práctica</button>
              </div>
            </div>

            {copyMessage ? (
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--fg-2)', marginBottom: 'var(--sp-2)' }}>{copyMessage}</p>
            ) : null}
            {inviteUrl ? (
              <input
                readOnly
                value={inviteUrl}
                style={{ fontSize: 'var(--text-body-sm)', padding: 'var(--sp-1) var(--sp-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 300, marginBottom: 'var(--sp-4)', display: 'block' }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            ) : null}

            {/* Stat row — 4 KPIs */}
            {(() => {
              const allPKnown = students.flatMap(s => s.skills?.map(sk => sk.pKnown) ?? [])
              const masteryAvg = allPKnown.length > 0 ? allPKnown.reduce((a, b) => a + b, 0) / allPKnown.length : 0
              const atRisk = students.filter(s => (s.skills ?? []).some(sk => sk.pKnown < 0.4)).length
              const unresolvedAlerts = alerts.filter(a => !a.resolvedAt).length
              return (
                <div className="t-stats">
                  <div className="card t-stat-card">
                    <div className="t-caption">Mastery promedio · curso</div>
                    <div className="t-stat math">{Math.round(masteryAvg * 100)}%</div>
                    <div className="t-delta t-delta-up">Datos en tiempo real</div>
                  </div>
                  <div className="card t-stat-card">
                    <div className="t-caption">Alumnos en riesgo</div>
                    <div className="t-stat math" style={{ color: atRisk > 0 ? 'var(--mastery-weak)' : undefined }}>{atRisk} <span className="t-stat-of">/ {students.length}</span></div>
                    <div className="t-delta">{atRisk > 0 ? 'Requieren atención' : 'Todos en buen nivel'}</div>
                  </div>
                  <div className="card t-stat-card">
                    <div className="t-caption">Alertas sin resolver</div>
                    <div className="t-stat math" style={{ color: unresolvedAlerts > 0 ? 'var(--mastery-weak)' : 'var(--mint-600)' }}>{unresolvedAlerts}</div>
                    <div className="t-delta">{unresolvedAlerts > 0 ? 'Requieren acción' : 'Sin alertas pendientes'}</div>
                  </div>
                  <div className="card t-stat-card">
                    <div className="t-caption">Alumnos en el aula</div>
                    <div className="t-stat math">{students.length}</div>
                    <div className="t-delta">{classroom.name}</div>
                  </div>
                </div>
              )
            })()}

            {selectedStudent ? (
              <StudentDetail
                studentId={selectedStudent.studentId}
                studentName={selectedStudent.studentName}
                attempts={selectedStudent.attempts ?? []}
                errorFrequency={selectedStudent.errorFrequency ?? []}
                onBack={() => setSelectedStudentId(null)}
              />
            ) : (
              <div className="t-grid-2">
                <div>
                  <div className="t-section-head">
                    <h2>Mastery del aula</h2>
                    <span>Toca una celda para ver el detalle</span>
                  </div>
                  <div className="t-heatmap">
                    <MasteryHeatmap
                      students={students}
                      onStudentClick={setSelectedStudentId}
                    />
                  </div>
                </div>

                <div>
                  <div className="t-section-head">
                    <h2>Alertas pendientes</h2>
                    <span>{alerts.filter(a => !a.resolvedAt).length} sin resolver</span>
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
