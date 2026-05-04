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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--fg-1)' }}>
            Alertas activas
          </h2>
          {unresolvedCount > 0 ? (
            <span className="text-xs font-semibold bg-[#fce8e8] text-[#7a1a1a] border border-[#f5b8b8] px-2 py-0.5 rounded-full">
              {unresolvedCount} sin resolver
            </span>
          ) : null}
        </div>

        {loadError ? (
          <p className="text-sm text-[#D86060]">{loadError}</p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#4F5868]">Cargando alertas...</p>
        ) : (
          <AlertsPanel
            alerts={alerts.filter((a) => !a.resolvedAt)}
            onResolve={handleResolve}
          />
        )}

        {!loading && alerts.filter((a) => a.resolvedAt).length > 0 ? (
          <div className="mt-8">
            <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--fg-2)' }}>
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
