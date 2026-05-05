'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface HeatmapData {
  classroomName: string
  students: Array<{ id: string; name: string }>
  skills: Array<{ id: string; name: string }>
  matrix: number[][]
  averageMastery: number
  lastUpdated: string
}

export default function ClassroomDashboardPage(): JSX.Element {
  const router = useRouter()
  const params = useParams()
  const classroomId = params?.classroomId as string
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      if (!classroomId) return

      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const response = await authClient.get(`/classrooms/${classroomId}/heatmap`)
        const data = (await response.json()) as HeatmapData
        setHeatmap(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar heatmap')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [classroomId])

  const masteryColor = (mastery: number): { bg: string; text: string } => {
    if (mastery >= 0.7) return { bg: '#dcfce7', text: '#166534' }
    if (mastery >= 0.4) return { bg: '#fef3c7', text: '#92400e' }
    return { bg: '#fee2e2', text: '#991b1b' }
  }

  const getRiskLevel = (mastery: number): string => {
    if (mastery >= 0.7) return 'Domina'
    if (mastery >= 0.4) return 'Progresa'
    return 'En riesgo'
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .cd-header { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 20px 24px; }
        .cd-header-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .cd-back { padding: 0; background: transparent; border: none; color: var(--sky-600); font-weight: 600; cursor: pointer; font-size: 14px; }
        .cd-back:hover { text-decoration: underline; }
        .cd-title { font-size: 24px; font-weight: 700; margin: 0; flex: 1; }
        
        .cd-container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
        
        /* Info */
        .cd-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px; background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; }
        .cd-stat { display: flex; flex-direction: column; gap: 4px; }
        .cd-stat-label { font-size: 13px; color: var(--fg-3); text-transform: uppercase; font-weight: 600; }
        .cd-stat-value { font-size: 20px; font-weight: 700; color: var(--fg-1); }
        
        /* Heatmap */
        .cd-heatmap-wrap { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; }
        .cd-heatmap { padding: 24px; }
        .cd-table { width: 100%; border-collapse: collapse; }
        .cd-th, .cd-td { padding: 12px; text-align: center; border: 1px solid var(--border); font-size: 13px; }
        .cd-th { background: var(--bg-2); font-weight: 700; }
        .cd-student-col { text-align: left; font-weight: 600; }
        .cd-cell { border-radius: 6px; cursor: pointer; transition: transform 0.2s; position: relative; }
        .cd-cell:hover { transform: scale(1.08); z-index: 10; }
        .cd-cell-value { font-weight: 700; font-size: 14px; }
        .cd-cell-label { font-size: 11px; opacity: 0.8; }
        .cd-legend { display: flex; gap: 20px; justify-content: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
        .cd-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .cd-legend-color { width: 24px; height: 24px; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div className="cd-header">
        <div className="cd-header-inner">
          <button className="cd-back" onClick={() => router.back()}>
            ← Volver
          </button>
          <h1 className="cd-title">{heatmap?.classroomName} - Heatmap</h1>
        </div>
      </div>

      {/* Content */}
      <div className="cd-container">
        {loading && <p>Cargando heatmap...</p>}
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && heatmap && (
          <>
            {/* Info */}
            <div className="cd-info">
              <div className="cd-stat">
                <span className="cd-stat-label">Dominio promedio</span>
                <span className="cd-stat-value">{(heatmap.averageMastery * 100).toFixed(1)}%</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-label">Estudiantes</span>
                <span className="cd-stat-value">{heatmap.students.length}</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-label">Habilidades</span>
                <span className="cd-stat-value">{heatmap.skills.length}</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-label">Última actualización</span>
                <span style={{ fontSize: '13px', color: 'var(--fg-2)' }}>
                  {new Date(heatmap.lastUpdated).toLocaleDateString('es-CL')}
                </span>
              </div>
            </div>

            {/* Heatmap Table */}
            <div className="cd-heatmap-wrap">
              <div className="cd-heatmap">
                <table className="cd-table">
                  <thead>
                    <tr>
                      <th className="cd-student-col">Alumno</th>
                      {heatmap.skills.map((skill) => (
                        <th key={skill.id}>{skill.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.students.map((student, sIdx) => (
                      <tr key={student.id}>
                        <td className="cd-student-col">{student.name}</td>
                        {heatmap.matrix[sIdx]?.map((mastery, kIdx) => {
                          const colors = masteryColor(mastery)
                          const riskLevel = getRiskLevel(mastery)
                          return (
                            <td
                              key={`${student.id}-${heatmap.skills[kIdx]?.id}`}
                              className="cd-cell"
                              style={{
                                background: colors.bg,
                                color: colors.text,
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                router.push(
                                  `/teacher/students/${student.id}`
                                )
                              }
                              title={`${student.name} - ${heatmap.skills[kIdx]?.name}: ${riskLevel}`}
                            >
                              <div className="cd-cell-value">
                                {(mastery * 100).toFixed(0)}%
                              </div>
                              <div className="cd-cell-label">{riskLevel}</div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="cd-legend">
                <div className="cd-legend-item">
                  <div className="cd-legend-color" style={{ background: '#dcfce7' }} />
                  <span>Domina (≥70%)</span>
                </div>
                <div className="cd-legend-item">
                  <div className="cd-legend-color" style={{ background: '#fef3c7' }} />
                  <span>Progresa (40-70%)</span>
                </div>
                <div className="cd-legend-item">
                  <div className="cd-legend-color" style={{ background: '#fee2e2' }} />
                  <span>En riesgo (&lt;40%)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
