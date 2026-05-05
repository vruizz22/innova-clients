'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface Alert {
  id: string
  type: 'AT_RISK' | 'COMMON_ERROR'
  student: { id: string; name: string }
  skill: { id: string; name: string }
  errorCount: number
  timestamp: string
  status: 'active' | 'resolved'
}

type TabType = 'active' | 'resolved' | 'all'

export default function AlertsInboxPage(): JSX.Element {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const response = await authClient.get('/alerts?limit=100')
        const data = (await response.json()) as Alert[]
        setAlerts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar alertas')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const filtered = alerts.filter((a) => {
    if (activeTab === 'all') return true
    return a.status === activeTab
  })

  const counts = {
    active: alerts.filter((a) => a.status === 'active').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    all: alerts.length,
  }

  const handleResolve = async (alertId: string): Promise<void> => {
    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      await authClient.patch(`/alerts/${alertId}/resolve`, {})
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
      )
    } catch (err) {
      console.error('Error resolving alert:', err)
    }
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .ai-header { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 20px 24px; }
        .ai-header-inner { max-width: 1200px; margin: 0 auto; }
        .ai-title { font-size: 24px; font-weight: 700; margin: 0 0 16px; }
        .ai-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border); }
        .ai-tab { padding: 12px 16px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: var(--fg-2); border-bottom: 2px solid transparent; transition: all 0.2s; }
        .ai-tab:hover { color: var(--fg-1); }
        .ai-tab.active { color: var(--sky-600); border-bottom-color: var(--sky-600); }
        
        .ai-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
        .ai-list { display: flex; flex-direction: column; gap: 12px; }
        .ai-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; gap: 16px; align-items: flex-start; transition: all 0.2s; }
        .ai-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-color: var(--sky-300); }
        
        .ai-card-icon { font-size: 24px; min-width: 32px; }
        .ai-card-main { flex: 1; }
        .ai-card-type { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
        .ai-card-type.risk { background: #fee2e2; color: #991b1b; }
        .ai-card-type.error { background: #fef3c7; color: #92400e; }
        .ai-card-status { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-left: 8px; }
        .ai-card-status.active { background: var(--sky-100); color: var(--sky-700); }
        .ai-card-status.resolved { background: #d1fae5; color: #065f46; }
        .ai-card-title { font-weight: 600; margin: 0 0 4px; font-size: 14px; }
        .ai-card-detail { font-size: 13px; color: var(--fg-2); margin: 0 0 8px; }
        .ai-card-meta { display: flex; gap: 16px; font-size: 12px; color: var(--fg-3); }
        
        .ai-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .ai-btn { padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ai-btn:hover { background: var(--bg-2); border-color: var(--sky-300); color: var(--sky-700); }
        .ai-btn.primary { background: var(--sky-600); color: #fff; border-color: var(--sky-600); }
        .ai-btn.primary:hover { background: var(--sky-700); }
        
        .ai-empty { text-align: center; padding: 60px 20px; color: var(--fg-2); }
        .ai-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .ai-empty-title { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: var(--fg-1); }
      `}</style>

      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-inner">
          <h1 className="ai-title">Alertas</h1>
          <div className="ai-tabs">
            <button
              className={`ai-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Activas ({counts.active})
            </button>
            <button
              className={`ai-tab ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resueltas ({counts.resolved})
            </button>
            <button
              className={`ai-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Todas ({counts.all})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ai-container">
        {loading && <p>Cargando alertas...</p>}
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="ai-empty">
            <div className="ai-empty-icon">
              {activeTab === 'active' && '✨'}
              {activeTab === 'resolved' && '📦'}
              {activeTab === 'all' && '📭'}
            </div>
            <h3 className="ai-empty-title">
              {activeTab === 'active' && 'Sin alertas pendientes'}
              {activeTab === 'resolved' && 'Sin alertas resueltas'}
              {activeTab === 'all' && 'Sin alertas'}
            </h3>
            <p>Todo está bajo control en este momento</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="ai-list">
            {filtered.map((alert) => (
              <div key={alert.id} className="ai-card">
                <div className="ai-card-icon">
                  {alert.type === 'AT_RISK' ? '⚠️' : '🔍'}
                </div>
                <div className="ai-card-main">
                  <p className="ai-card-title">
                    {alert.student.name}
                    <span className={`ai-card-type ${alert.type === 'AT_RISK' ? 'risk' : 'error'}`}>
                      {alert.type === 'AT_RISK' ? 'En riesgo' : 'Error común'}
                    </span>
                    <span className={`ai-card-status ${alert.status}`}>
                      {alert.status === 'active' ? 'Activa' : 'Resuelta'}
                    </span>
                  </p>
                  <p className="ai-card-detail">{alert.skill.name}</p>
                  <div className="ai-card-meta">
                    <span>{alert.errorCount} errores</span>
                    <span>{new Date(alert.timestamp).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
                <div className="ai-card-actions">
                  <button
                    className="ai-btn"
                    onClick={() => router.push(`/teacher/students/${alert.student.id}`)}
                  >
                    Ver perfil
                  </button>
                  {alert.status === 'active' && (
                    <button
                      className="ai-btn primary"
                      onClick={() => void handleResolve(alert.id)}
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
