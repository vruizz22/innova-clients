'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface Student {
  id: string
  name: string
}

interface Skill {
  id: string
  name: string
}

interface HeatmapData {
  students: Student[]
  skills: Skill[]
  matrix: number[][]
}

interface KPI {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
}

interface Alert {
  id: string
  type: 'AT_RISK' | 'COMMON_ERROR'
  student: { id: string; name: string }
  skill: { id: string; name: string }
  errorCount: number
  timestamp: string
}

export default function TeacherDashboard(): JSX.Element {
  const router = useRouter()
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        // Cargar datos de heatmap
        const heatmapRes = await authClient.get('/teacher/dashboard/heatmap')
        const heatmapData = (await heatmapRes.json()) as HeatmapData
        setHeatmap(heatmapData)

        // Cargar alertas
        const alertsRes = await authClient.get('/alerts?status=active&limit=4')
        const alertsData = (await alertsRes.json()) as Alert[]
        setAlerts(alertsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar dashboard')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const kpis: KPI[] = [
    {
      label: 'Mastery promedio',
      value: '0.62',
      change: '+0.04',
      trend: 'up',
    },
    {
      label: 'Alumnos en riesgo',
      value: '8/32',
      change: '+2',
      trend: 'down',
    },
    {
      label: 'Alertas sin resolver',
      value: alerts.length,
    },
    {
      label: 'Práctica completada',
      value: '73%',
      change: '+8%',
      trend: 'up',
    },
  ]

  const masteryColor = (mastery: number): string => {
    if (mastery >= 0.7) return '#16a34a'
    if (mastery >= 0.4) return '#f59e0b'
    return '#dc2626'
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .td-container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
        .td-header { margin-bottom: 32px; }
        .td-greeting { font-size: 28px; font-weight: 700; margin: 0 0 24px; }
        .td-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .td-kpi-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .td-kpi-label { font-size: 13px; color: var(--fg-2); text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
        .td-kpi-value { font-size: 28px; font-weight: 700; color: var(--fg-1); margin: 0; }
        .td-kpi-change { font-size: 12px; margin-top: 4px; }
        .td-kpi-change.up { color: #16a34a; }
        .td-kpi-change.down { color: #dc2626; }
        
        .td-section-title { font-size: 18px; font-weight: 700; margin: 32px 0 16px; }
        
        /* Heatmap */
        .td-heatmap { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; }
        .td-heatmap-inner { min-width: 600px; padding: 20px; }
        .td-heatmap-table { width: 100%; border-collapse: collapse; }
        .td-heatmap-th, .td-heatmap-td { padding: 10px; text-align: center; border: 1px solid var(--border); font-size: 13px; }
        .td-heatmap-th { background: var(--bg-2); font-weight: 700; }
        .td-heatmap-cell { cursor: pointer; border-radius: 4px; transition: transform 0.2s; }
        .td-heatmap-cell:hover { transform: scale(1.05); }
        .td-heatmap-student { text-align: left; font-weight: 600; }
        
        /* Alerts */
        .td-alerts { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .td-alerts-list { display: flex; flex-direction: column; gap: 12px; }
        .td-alert-card { display: flex; gap: 12px; padding: 12px; background: var(--bg-2); border-radius: 8px; align-items: center; cursor: pointer; transition: all 0.2s; }
        .td-alert-card:hover { background: var(--sky-50); }
        .td-alert-icon { font-size: 20px; min-width: 24px; }
        .td-alert-content { flex: 1; }
        .td-alert-title { font-weight: 600; font-size: 13px; margin: 0; }
        .td-alert-detail { font-size: 12px; color: var(--fg-3); margin: 2px 0 0; }
        .td-alert-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .td-alert-badge.risk { background: #fee2e2; color: #991b1b; }
        .td-alert-badge.error { background: #fef3c7; color: #92400e; }
        .td-alert-action { padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .td-alert-action:hover { background: var(--sky-600); color: #fff; border-color: var(--sky-600); }
        
        .td-view-all { color: var(--sky-600); text-decoration: none; font-weight: 600; font-size: 13px; margin-top: 12px; display: inline-block; }
        .td-view-all:hover { text-decoration: underline; }
      `}</style>

      <div className="td-container">
        {/* Header */}
        <div className="td-header">
          <h1 className="td-greeting">Buenas tardes, Sra. González</h1>
        </div>

        {loading && <p>Cargando dashboard...</p>}
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && (
          <>
            {/* KPIs */}
            <div className="td-kpis">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="td-kpi-card">
                  <div className="td-kpi-label">{kpi.label}</div>
                  <p className="td-kpi-value">{kpi.value}</p>
                  {kpi.change && (
                    <div className={`td-kpi-change ${kpi.trend}`}>
                      {kpi.trend === 'up' ? '▲' : '▼'} {kpi.change} vs sem. anterior
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Heatmap */}
            <h2 className="td-section-title">Progreso por habilidad</h2>
            {heatmap ? (
              <div className="td-heatmap">
                <div className="td-heatmap-inner">
                  <table className="td-heatmap-table">
                    <thead>
                      <tr>
                        <th>Alumno</th>
                        {heatmap.skills.map((skill) => (
                          <th key={skill.id}>{skill.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.students.map((student, sIdx) => (
                        <tr key={student.id}>
                          <td className="td-heatmap-student">{student.name}</td>
                          {heatmap.matrix[sIdx]?.map((mastery, kIdx) => (
                            <td
                              key={`${student.id}-${heatmap.skills[kIdx]?.id}`}
                              className="td-heatmap-cell"
                              style={{
                                background: masteryColor(mastery),
                                color: '#fff',
                                cursor: 'pointer',
                              }}
                              onClick={() => router.push(`/teacher/students/${student.id}`)}
                            >
                              {mastery.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-2)' }}>
                No hay datos disponibles
              </div>
            )}

            {/* Alerts */}
            <h2 className="td-section-title">Alertas pendientes</h2>
            <div className="td-alerts">
              {alerts.length === 0 ? (
                <p style={{ color: 'var(--fg-2)', margin: 0 }}>No hay alertas pendientes</p>
              ) : (
                <div className="td-alerts-list">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className="td-alert-card"
                      onClick={() => router.push(`/teacher/alerts/${alert.id}`)}
                    >
                      <div className="td-alert-icon">
                        {alert.type === 'AT_RISK' ? '⚠️' : '🔍'}
                      </div>
                      <div className="td-alert-content">
                        <p className="td-alert-title">
                          {alert.student.name}
                          <span
                            className={`td-alert-badge ${
                              alert.type === 'AT_RISK' ? 'risk' : 'error'
                            }`}
                            style={{ marginLeft: '8px' }}
                          >
                            {alert.type === 'AT_RISK' ? 'EN RIESGO' : 'ERROR COMÚN'}
                          </span>
                        </p>
                        <p className="td-alert-detail">
                          {alert.skill.name} • {alert.errorCount} errores
                        </p>
                      </div>
                      <button className="td-alert-action">Ver</button>
                    </div>
                  ))}
                </div>
              )}
              <a href="/teacher/alerts" className="td-view-all">
                Ver todas las alertas →
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
