'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@components/DashboardLayout';
import { AlertsPanel } from '@components/AlertsPanel';
import { createApiClient, type TeacherAlertRecord } from '@components/api-client';
import { getAccessToken } from '@shared/auth-session';
import type { TeacherAlert } from '@lib/types';

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

export default function AlertsPage(): JSX.Element {
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000', []);
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: apiBaseUrl, getAccessToken }),
    [apiBaseUrl],
  );

  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const backendAlerts = await apiClient.listAlerts(CLASSROOM_ID);
        setAlerts(backendAlerts.map(mapBackendAlert));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar las alertas');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [apiClient]);

  const handleResolve = (id: string): void => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolvedAt: new Date().toISOString() } : a)),
    );
    void apiClient.resolveAlert(id).catch((err: unknown) => {
      setLoadError(err instanceof Error ? err.message : 'No se pudo resolver la alerta');
    });
  };

  const unresolvedCount = alerts.filter((a) => !a.resolvedAt).length;

  return (
    <DashboardLayout unresolvedAlertCount={unresolvedCount}>
      <div className="page-section">
        <div className="page-section-head">
          <h2>Alertas activas</h2>
          {unresolvedCount > 0 ? (
            <span className="alert-count-badge">
              {unresolvedCount} sin resolver
            </span>
          ) : null}
        </div>

        {loadError ? (
          <p style={{ color: 'var(--mastery-weak)', fontSize: 'var(--text-body-sm)' }}>{loadError}</p>
        ) : null}

        {loading ? (
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)' }}>Cargando alertas...</p>
        ) : (
          <AlertsPanel
            alerts={alerts.filter((a) => !a.resolvedAt)}
            onResolve={handleResolve}
          />
        )}

        {!loading && alerts.filter((a) => a.resolvedAt).length > 0 ? (
          <div style={{ marginTop: 'var(--sp-8)' }}>
            <h3 style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--fw-semibold)', color: 'var(--fg-2)', marginBottom: 'var(--sp-3)' }}>
              Resueltas
            </h3>
            <AlertsPanel
              alerts={alerts.filter((a) => a.resolvedAt)}
              onResolve={handleResolve}
            />
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
