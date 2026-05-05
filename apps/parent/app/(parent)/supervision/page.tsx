'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@shared/auth-session'
import { createApiClient } from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface StudentSupervision {
  id: string
  name: string
  grade: string
  school: string
  masteryAverage: number
  activeAlerts: number
  daysThisWeek: number
  lastActivity: string
}

export default function ParentSupervisionPage(): JSX.Element {
  const router = useRouter()
  const [students, setStudents] = useState<StudentSupervision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const config = getPublicRuntimeConfig()
        const client = createApiClient({ baseUrl: config.apiUrl, getAccessToken })
        const response = await client.get('/parent/students')
        const data = (await response.json()) as StudentSupervision[]
        setStudents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estudiantes')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const masteryColor = (mastery: number): string => {
    if (mastery >= 0.7) return '#16a34a'
    if (mastery >= 0.4) return '#f59e0b'
    return '#dc2626'
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .ps-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        .ps-header { margin-bottom: 32px; }
        .ps-title { font-size: 28px; font-weight: 700; margin: 0; }
        
        .ps-list { display: flex; flex-direction: column; gap: 12px; }
        .ps-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s; }
        .ps-card:hover { background: var(--sky-50); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        
        .ps-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--sky-500); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
        
        .ps-info { flex: 1; }
        .ps-name { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--fg-1); }
        .ps-school { font-size: 12px; color: var(--fg-3); margin: 0; }
        
        .ps-stats { display: flex; gap: 24px; align-items: center; }
        .ps-stat { text-align: center; }
        .ps-stat-label { font-size: 10px; color: var(--fg-3); text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
        .ps-stat-value { font-size: 18px; font-weight: 700; }
        
        .ps-alert-badge { width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        
        .ps-arrow { color: var(--sky-600); font-size: 18px; flex-shrink: 0; }
      `}</style>

      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <h1 className="ps-title">Supervisión</h1>
        </div>

        {loading && <p>Cargando estudiantes...</p>}
        {error && (
          <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="ps-list">
            {students.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--fg-2)' }}>No hay estudiantes supervisados</p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="ps-card"
                  onClick={() => router.push(`/supervision/${student.id}`)}
                >
                  <div className="ps-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="ps-info">
                    <p className="ps-name">{student.name}</p>
                    <p className="ps-school">
                      {student.grade} · {student.school}
                    </p>
                  </div>

                  <div className="ps-stats">
                    <div className="ps-stat">
                      <div className="ps-stat-label">Dominio</div>
                      <div
                        className="ps-stat-value"
                        style={{ color: masteryColor(student.masteryAverage) }}
                      >
                        {(student.masteryAverage * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="ps-stat">
                      <div className="ps-stat-label">Esta semana</div>
                      <div className="ps-stat-value">{student.daysThisWeek}d</div>
                    </div>

                    {student.activeAlerts > 0 && (
                      <div className="ps-alert-badge" title="Alertas activas">
                        {student.activeAlerts}
                      </div>
                    )}
                  </div>

                  <div className="ps-arrow">→</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
