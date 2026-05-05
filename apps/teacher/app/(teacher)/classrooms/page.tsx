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
  initials: string
  masteryPercent: number
}

interface Classroom {
  id: string
  name: string
  subject: string
  semester: string
  school: string
  grade: string
  code: string
  studentCount: number
  students: Student[]
}

export default function ClassroomsPage(): JSX.Element {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadClassrooms(): Promise<void> {
      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const response = await authClient.get('/classrooms/teacher/mine')
        const data = (await response.json()) as Classroom[]

        setClassrooms(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cursos')
      } finally {
        setLoading(false)
      }
    }

    void loadClassrooms()
  }, [])

  const filtered = classrooms.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function handleCopyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  const masteryColor = (percent: number): string => {
    if (percent >= 70) return '#16a34a'
    if (percent >= 40) return '#f59e0b'
    return '#dc2626'
  }

  return (
    <main className="t-shell">
      <style>{`
        .t-shell { background: var(--bg-2); min-height: 100vh; padding: 0; }
        
        /* Header */
        .t-header { position: sticky; top: 0; z-index: 30; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 16px 24px; }
        .t-header-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .t-header-left { display: flex; gap: 20px; align-items: center; flex: 1; }
        .t-search { flex: 1; max-width: 300px; }
        .t-search input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; background: var(--bg-1); color: var(--fg-1); }
        .t-search input::placeholder { color: var(--fg-3); }
        .t-search input:focus { outline: none; border-color: var(--sky-500); box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
        
        .t-btn-new { padding: 8px 16px; border-radius: 8px; border: none; background: var(--sky-600); color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
        .t-btn-new:hover { background: var(--sky-700); }
        
        /* Container */
        .t-classrooms-container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
        .t-classrooms-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
        .t-classrooms-subtitle { color: var(--fg-2); font-size: 15px; margin: 0 0 28px; }
        
        /* Grid */
        .t-classrooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        
        /* Card */
        .t-classroom-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s, border-color 0.2s; }
        .t-classroom-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-color: var(--sky-300); }
        
        .t-card-header { padding: 20px; border-bottom: 1px solid var(--border); }
        .t-card-title { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
        .t-card-subtitle { font-size: 13px; color: var(--fg-2); margin: 0; }
        
        .t-card-meta { padding: 16px 20px; display: flex; gap: 20px; border-bottom: 1px solid var(--border); font-size: 13px; }
        .t-card-meta-item { display: flex; flex-direction: column; gap: 4px; }
        .t-card-meta-label { color: var(--fg-3); font-size: 11px; text-transform: uppercase; font-weight: 600; }
        .t-card-meta-value { color: var(--fg-1); font-weight: 600; }
        
        .t-card-code { padding: 16px 20px; background: var(--sky-50); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .t-code-display { flex: 1; font-family: 'ui-monospace, monospace'; font-size: 14px; font-weight: 700; color: var(--sky-700); }
        .t-code-btn { padding: 6px 12px; border-radius: 6px; border: 1px solid var(--sky-300); background: transparent; color: var(--sky-700); font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .t-code-btn:hover { background: var(--sky-100); }
        .t-code-btn.copied { background: #d1fae5; border-color: #86efac; color: #065f46; }
        
        .t-card-body { padding: 20px; }
        
        /* Students list */
        .t-students-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .t-students-header h4 { font-size: 14px; font-weight: 700; margin: 0; }
        .t-btn-toggle { padding: 4px 8px; font-size: 12px; background: transparent; border: none; color: var(--sky-600); cursor: pointer; font-weight: 600; }
        .t-btn-toggle:hover { text-decoration: underline; }
        
        .t-students-list { display: flex; flex-direction: column; gap: 8px; }
        .t-student-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; background: var(--bg-2); }
        .t-student-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--sky-200); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--sky-700); font-size: 12px; }
        .t-student-info { flex: 1; }
        .t-student-name { font-size: 13px; font-weight: 600; margin: 0; }
        .t-student-mastery { font-size: 11px; color: var(--fg-3); margin: 0; }
        .t-student-percent { font-weight: 700; font-size: 13px; }
        
        /* Actions */
        .t-card-actions { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
        .t-action-btn { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--fg-1); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .t-action-btn:hover { background: var(--bg-2); border-color: var(--sky-300); color: var(--sky-700); }
        .t-action-btn.primary { background: var(--sky-600); color: #fff; border-color: var(--sky-600); }
        .t-action-btn.primary:hover { background: var(--sky-700); }
        
        /* Empty state */
        .t-empty { text-align: center; padding: 60px 20px; }
        .t-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .t-empty-title { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
        .t-empty-text { color: var(--fg-2); margin: 0; }
      `}</style>

      {/* Header */}
      <div className="t-header">
        <div className="t-header-inner">
          <div className="t-header-left">
            <div className="t-search">
              <input
                type="text"
                placeholder="Buscar curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="t-btn-new" onClick={() => router.push('/teacher/new-classroom')}>
            + Crear curso
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="t-classrooms-container">
        <div>
          <h1 className="t-classrooms-title">Mis cursos</h1>
          <p className="t-classrooms-subtitle">{filtered.length} cursos activos</p>
        </div>

        {loading && (
          <div className="t-empty">
            <p>Cargando cursos...</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="t-empty">
            <div className="t-empty-icon">📚</div>
            <h3 className="t-empty-title">No tienes cursos</h3>
            <p className="t-empty-text">Crea tu primer curso para comenzar</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="t-classrooms-grid">
            {filtered.map((classroom) => (
              <div key={classroom.id} className="t-classroom-card">
                {/* Header */}
                <div className="t-card-header">
                  <h3 className="t-card-title">{classroom.name}</h3>
                  <p className="t-card-subtitle">{classroom.grade} · {classroom.subject}</p>
                </div>

                {/* Meta */}
                <div className="t-card-meta">
                  <div className="t-card-meta-item">
                    <span className="t-card-meta-label">Período</span>
                    <span className="t-card-meta-value">{classroom.semester}</span>
                  </div>
                  <div className="t-card-meta-item">
                    <span className="t-card-meta-label">Colegio</span>
                    <span className="t-card-meta-value">{classroom.school}</span>
                  </div>
                  <div className="t-card-meta-item">
                    <span className="t-card-meta-label">Alumnos</span>
                    <span className="t-card-meta-value">{classroom.studentCount}</span>
                  </div>
                </div>

                {/* Code */}
                <div className="t-card-code">
                  <span className="t-code-display">{classroom.code}</span>
                  <button
                    className={`t-code-btn ${copiedCode === classroom.code ? 'copied' : ''}`}
                    onClick={() => handleCopyCode(classroom.code)}
                  >
                    {copiedCode === classroom.code ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>

                {/* Body */}
                <div className="t-card-body">
                  <div className="t-students-header">
                    <h4>Alumnos</h4>
                    <button
                      className="t-btn-toggle"
                      onClick={() => setExpandedId(expandedId === classroom.id ? null : classroom.id)}
                    >
                      {expandedId === classroom.id ? '▼ Ocultar' : '▶ Mostrar'}
                    </button>
                  </div>

                  {expandedId === classroom.id && (
                    <div className="t-students-list">
                      {classroom.students.slice(0, 5).map((student) => (
                        <div key={student.id} className="t-student-item">
                          <div className="t-student-avatar">{student.initials}</div>
                          <div className="t-student-info">
                            <p className="t-student-name">{student.name}</p>
                            <p className="t-student-mastery">Dominio</p>
                          </div>
                          <div className="t-student-percent" style={{ color: masteryColor(student.masteryPercent) }}>
                            {student.masteryPercent}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="t-card-actions">
                  <button
                    className="t-action-btn"
                    onClick={() => router.push(`/teacher/classroom/${classroom.id}/dashboard`)}
                  >
                    Heatmap
                  </button>
                  <button
                    className="t-action-btn primary"
                    onClick={() => router.push(`/teacher/classroom/${classroom.id}/assign`)}
                  >
                    Asignar práctica
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
