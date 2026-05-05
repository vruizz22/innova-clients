'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@shared/auth-session'
import { createApiClient } from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface SkillMastery {
  skillId: string
  skillName: string
  mastery: number
}

interface ActivityItem {
  id: string
  type: 'completed' | 'alert' | 'streak' | 'auto_assign' | 'note'
  title: string
  description: string
  timestamp: string
}

interface StudentInfo {
  id: string
  name: string
  grade: string
  school: string
  masteryAverage: number
  activeAlerts: number
  daysThisWeek: number
  skills: SkillMastery[]
  weekActivity: Array<{ day: string; completed: boolean }>
  activities: ActivityItem[]
  teacherNote?: string
}

export default function ParentDashboardPage(): JSX.Element {
  const router = useRouter()
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const config = getPublicRuntimeConfig()
        const client = createApiClient({ baseUrl: config.apiUrl, getAccessToken })
        const response = await client.get('/parent/dashboard')
        const data = (await response.json()) as StudentInfo
        setStudent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar dashboard')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

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
        .pd-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        .pd-header { margin-bottom: 32px; }
        .pd-greeting { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
        .pd-student-info { font-size: 14px; color: var(--fg-2); }
        
        .pd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 32px; }
        .pd-stat-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; }
        .pd-stat-label { font-size: 11px; color: var(--fg-3); text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
        .pd-stat-value { font-size: 28px; font-weight: 700; color: var(--fg-1); }
        
        .pd-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }
        .pd-section { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .pd-section-title { font-size: 16px; font-weight: 700; margin: 0 0 16px; }
        
        /* Skills */
        .pd-skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .pd-skill { padding: 12px; background: var(--bg-2); border-radius: 8px; }
        .pd-skill-name { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
        .pd-skill-bar { width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
        .pd-skill-fill { height: 100%; transition: width 0.3s ease; }
        .pd-skill-pct { font-size: 11px; font-weight: 600; }
        
        /* Activity Tracker */
        .pd-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 16px; }
        .pd-day { text-align: center; }
        .pd-day-label { font-size: 11px; color: var(--fg-3); font-weight: 600; margin-bottom: 4px; }
        .pd-day-box { width: 100%; aspect-ratio: 1; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .pd-day-box.done { background: #dcfce7; color: #16a34a; }
        .pd-day-box.skip { background: #f3f4f6; color: var(--fg-3); }
        
        /* Next Practice */
        .pd-next-practice { background: var(--sky-50); border: 1px solid var(--sky-200); border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; }
        .pd-next-practice:hover { background: var(--sky-100); }
        .pd-next-title { font-weight: 600; font-size: 13px; color: var(--fg-1); }
        .pd-next-meta { font-size: 12px; color: var(--fg-2); margin-top: 4px; }
        
        /* Activity Feed */
        .pd-activity-list { display: flex; flex-direction: column; gap: 12px; }
        .pd-activity-item { padding: 12px; background: var(--bg-2); border-radius: 8px; border-left: 3px solid var(--sky-500); }
        .pd-activity-title { font-weight: 600; font-size: 13px; margin: 0 0 4px; }
        .pd-activity-desc { font-size: 12px; color: var(--fg-2); margin: 0; }
        .pd-activity-time { font-size: 11px; color: var(--fg-3); margin-top: 4px; }
        
        .pd-teacher-note { background: #fef3c7; border-left: 3px solid #f59e0b; }
        .pd-alert-item { border-left-color: #dc2626; }
        
        /* Teacher Note */
        .pd-note-card { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; }
        .pd-note-label { font-size: 11px; font-weight: 600; color: #92400e; text-transform: uppercase; margin-bottom: 8px; }
        .pd-note-text { font-size: 13px; color: #78350f; line-height: 1.5; margin: 0; }
        .pd-note-author { font-size: 11px; color: #92400e; margin-top: 8px; font-weight: 600; }
      `}</style>

      <div className="pd-container">
        {/* Header */}
        <div className="pd-header">
          <h1 className="pd-greeting">Hola, Carolina</h1>
          {student && (
            <p className="pd-student-info">
              {student.name} · {student.grade} · {student.school}
            </p>
          )}
        </div>

        {loading && <p>Cargando dashboard...</p>}
        {error && (
          <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {!loading && !error && student && (
          <>
            {/* Stats */}
            <div className="pd-stats">
              <div className="pd-stat-card">
                <div className="pd-stat-label">Días esta semana</div>
                <div className="pd-stat-value">{student.daysThisWeek}</div>
              </div>
              <div className="pd-stat-card">
                <div className="pd-stat-label">Dominio promedio</div>
                <div className="pd-stat-value">{(student.masteryAverage * 100).toFixed(0)}%</div>
              </div>
              <div className="pd-stat-card">
                <div className="pd-stat-label">Alertas activas</div>
                <div className="pd-stat-value" style={{ color: student.activeAlerts > 0 ? '#dc2626' : '#16a34a' }}>
                  {student.activeAlerts}
                </div>
              </div>
            </div>

            {/* Main Row: Skills + Activity Tracker */}
            <div className="pd-row">
              {/* Skills */}
              <div className="pd-section">
                <h2 className="pd-section-title">Dominio por habilidad</h2>
                <div className="pd-skills-grid">
                  {student.skills.map((skill) => {
                    const colors = masteryColor(skill.mastery)
                    return (
                      <div key={skill.skillId} className="pd-skill">
                        <div className="pd-skill-name">{skill.skillName}</div>
                        <div className="pd-skill-bar">
                          <div
                            className="pd-skill-fill"
                            style={{
                              width: `${skill.mastery * 100}%`,
                              background: colors.bg.replace('#', '').startsWith('dcfce7')
                                ? '#16a34a'
                                : colors.bg.replace('#', '').startsWith('fef3c7')
                                  ? '#f59e0b'
                                  : '#dc2626',
                            }}
                          />
                        </div>
                        <div className="pd-skill-pct" style={{ color: colors.text }}>
                          {(skill.mastery * 100).toFixed(0)}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Activity Tracker */}
              <div className="pd-section">
                <h2 className="pd-section-title">Esta semana</h2>
                <div className="pd-week">
                  {student.weekActivity.map((day) => (
                    <div key={day.day} className="pd-day">
                      <div className="pd-day-label">{day.day}</div>
                      <div className={`pd-day-box ${day.completed ? 'done' : 'skip'}`}>
                        {day.completed ? '✓' : '–'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Practice & Activities Row */}
            <div className="pd-row">
              {/* Next Practice */}
              <div className="pd-section">
                <h2 className="pd-section-title">Próxima práctica</h2>
                <div
                  className="pd-next-practice"
                  onClick={() => router.push('/practice')}
                >
                  <p className="pd-next-title">Resta con reserva</p>
                  <p className="pd-next-meta">15 ejercicios · ~10 min</p>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="pd-section">
                <h2 className="pd-section-title">Actividad reciente</h2>
                <div className="pd-activity-list">
                  {student.activities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className={`pd-activity-item ${
                        activity.type === 'alert' ? 'pd-alert-item' : ''
                      }`}
                    >
                      <p className="pd-activity-title">{activity.title}</p>
                      <p className="pd-activity-desc">{activity.description}</p>
                      <p className="pd-activity-time">
                        {new Date(activity.timestamp).toLocaleString('es-CL')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher Note */}
            {student.teacherNote && (
              <div className="pd-section">
                <h2 className="pd-section-title">Nota del profesor</h2>
                <div className="pd-note-card">
                  <div className="pd-note-label">📝 Nota</div>
                  <p className="pd-note-text">{student.teacherNote}</p>
                  <div className="pd-note-author">Sra. González · hace 2 días</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
