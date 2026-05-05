'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@components/DashboardLayout';
import { AlertsPanel } from '@components/AlertsPanel';
import { createApiClient, type TeacherAlertRecord } from '@components/api-client';
import { getAccessToken } from '@shared/auth-session';
import { getPublicRuntimeConfig } from '@shared/runtime-config';
import { useFirstClassroomId } from '@lib/use-classroom';
import type { TeacherAlert } from '@lib/types';

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

export default function AlertsPage(): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig();
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: runtimeConfig.apiUrl, getAccessToken }),
    [runtimeConfig.apiUrl],
  );

  const { classroomId, loading: classroomLoading, error: classroomError } = useFirstClassroomId(apiClient);

  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classroomLoading || !classroomId) return;

    setLoading(true);
    async function load(): Promise<void> {
      try {
        const backendAlerts = await apiClient.listAlerts(classroomId as string);
        setAlerts(backendAlerts.map((alert) => mapBackendAlert(alert, classroomId as string)));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar las alertas');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [apiClient, classroomId, classroomLoading]);

  const handleResolve = (id: string): void => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolvedAt: new Date().toISOString() } : a)),
    );
    void apiClient.resolveAlert(id).catch((err: unknown) => {
      setLoadError(err instanceof Error ? err.message : 'No se pudo resolver la alerta');
    });
  };

  const unresolvedCount = alerts.filter((a) => !a.resolvedAt).length;
  const error = classroomError || loadError;
  const isLoading = classroomLoading || loading;

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

        {error ? (
          <p style={{ color: 'var(--mastery-weak)', fontSize: 'var(--text-body-sm)' }}>{error}</p>
        ) : null}

        {!error && !classroomId && !classroomLoading ? (
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)' }}>
            No tienes un classroom asignado. Crea uno desde el dashboard principal.
          </p>
        ) : null}

        {isLoading ? (
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--text-body-sm)' }}>Cargando alertas...</p>
        ) : (
          <AlertsPanel
            alerts={alerts.filter((a) => !a.resolvedAt)}
            onResolve={handleResolve}
          />
        )}

        {!isLoading && alerts.filter((a) => a.resolvedAt).length > 0 ? (
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
