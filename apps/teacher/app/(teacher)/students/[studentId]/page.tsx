'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface SkillMastery {
  skillId: string
  skillName: string
  mastery: number
  itemCount: number
}

interface Attempt {
  id: string
  skillId: string
  skillName: string
  date: string
  correct: boolean
  expression: string
  expectedAnswer: string
  studentAnswer: string
}

interface StudentProfile {
  id: string
  name: string
  email: string
  grade: string
  skills: SkillMastery[]
  attempts: Attempt[]
}

export default function StudentProfilePage(): JSX.Element {
  const router = useRouter()
  const params = useParams()
  const studentId = params?.studentId as string
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)

  useEffect(() => {
    async function load(): Promise<void> {
      if (!studentId) return

      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const response = await authClient.get(`/students/${studentId}/profile`)
        const data = (await response.json()) as StudentProfile
        setStudent(data)
        setNotes(data.notes || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [studentId])

  const handleSaveNotes = async (): Promise<void> => {
    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      await authClient.patch(`/students/${studentId}`, { notes })
      setEditingNotes(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar notas')
    }
  }

  const masteryColor = (mastery: number): string => {
    if (mastery >= 0.7) return '#16a34a'
    if (mastery >= 0.4) return '#f59e0b'
    return '#dc2626'
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .sp-header { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 20px 24px; }
        .sp-header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .sp-back { padding: 0; background: transparent; border: none; color: var(--sky-600); font-weight: 600; cursor: pointer; font-size: 14px; }
        .sp-back:hover { text-decoration: underline; }
        .sp-title { font-size: 24px; font-weight: 700; margin: 0; flex: 1; }
        
        .sp-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
        .sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        
        /* Card */
        .sp-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
        .sp-card-title { font-size: 16px; font-weight: 700; margin: 0 0 16px; }
        
        /* Hero */
        .sp-hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
        .sp-avatar { width: 80px; height: 80px; border-radius: 12px; background: var(--sky-200); display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; }
        .sp-info h2 { margin: 0 0 4px; }
        .sp-info p { margin: 0; font-size: 13px; color: var(--fg-2); }
        
        /* Mastery Grid */
        .sp-mastery-grid { display: grid; gap: 12px; }
        .sp-mastery-item { display: flex; gap: 12px; align-items: center; padding: 12px; background: var(--bg-2); border-radius: 8px; }
        .sp-mastery-bar { flex: 1; }
        .sp-mastery-label { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
        .sp-mastery-progress { width: 100%; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .sp-mastery-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .sp-mastery-percent { font-weight: 700; font-size: 13px; min-width: 40px; text-align: right; }
        
        /* Notes */
        .sp-notes { margin-top: 16px; }
        .sp-notes-textarea { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-family: inherit; resize: vertical; min-height: 100px; }
        .sp-notes-textarea:focus { outline: none; border-color: var(--sky-500); box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
        .sp-notes-buttons { display: flex; gap: 8px; margin-top: 8px; }
        .sp-btn { padding: 6px 12px; border-radius: 6px; border: none; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .sp-btn-primary { background: var(--sky-600); color: #fff; }
        .sp-btn-primary:hover { background: var(--sky-700); }
        .sp-btn-secondary { background: var(--border); color: var(--fg-1); }
        .sp-btn-secondary:hover { background: var(--bg-2); }
        
        /* Attempts */
        .sp-attempts { display: flex; flex-direction: column; gap: 12px; }
        .sp-attempt-item { display: flex; gap: 12px; padding: 12px; background: var(--bg-2); border-radius: 8px; }
        .sp-attempt-icon { font-size: 18px; min-width: 24px; }
        .sp-attempt-info { flex: 1; }
        .sp-attempt-title { font-weight: 600; font-size: 13px; margin: 0 0 2px; }
        .sp-attempt-detail { font-size: 12px; color: var(--fg-3); margin: 0; }
        .sp-attempt-date { font-size: 11px; color: var(--fg-3); margin-top: 4px; }
      `}</style>

      {/* Header */}
      <div className="sp-header">
        <div className="sp-header-inner">
          <button className="sp-back" onClick={() => router.back()}>
            ← Volver
          </button>
          <h1 className="sp-title">Perfil del alumno</h1>
        </div>
      </div>

      {/* Content */}
      <div className="sp-container">
        {loading && <p>Cargando perfil...</p>}
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && student && (
          <div className="sp-grid">
            {/* Left: Info + Mastery */}
            <div>
              {/* Hero */}
              <div className="sp-hero">
                <div className="sp-avatar">👤</div>
                <div className="sp-info">
                  <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{student.name}</h2>
                  <p>{student.email}</p>
                  <p>{student.grade} básico</p>
                </div>
              </div>

              {/* Mastery */}
              <div className="sp-card">
                <h3 className="sp-card-title">Dominio por habilidad</h3>
                <div className="sp-mastery-grid">
                  {student.skills.map((skill) => (
                    <div key={skill.skillId} className="sp-mastery-item">
                      <div className="sp-mastery-bar">
                        <div className="sp-mastery-label">{skill.skillName}</div>
                        <div className="sp-mastery-progress">
                          <div
                            className="sp-mastery-fill"
                            style={{
                              width: `${skill.mastery * 100}%`,
                              background: masteryColor(skill.mastery),
                            }}
                          />
                        </div>
                      </div>
                      <div className="sp-mastery-percent" style={{ color: masteryColor(skill.mastery) }}>
                        {(skill.mastery * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="sp-card" style={{ marginTop: '20px' }}>
                <h3 className="sp-card-title">Notas del profesor</h3>
                {!editingNotes ? (
                  <div style={{ padding: '12px', background: 'var(--bg-2)', borderRadius: '8px', minHeight: '80px', fontSize: '13px', color: notes ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                    {notes || 'Sin notas...'}
                    <button
                      style={{
                        display: 'block',
                        marginTop: '12px',
                        color: 'var(--sky-600)',
                        background: 'transparent',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                      onClick={() => setEditingNotes(true)}
                    >
                      Editar
                    </button>
                  </div>
                ) : (
                  <div className="sp-notes">
                    <textarea
                      className="sp-notes-textarea"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="sp-notes-buttons">
                      <button className="sp-btn sp-btn-primary" onClick={() => void handleSaveNotes()}>
                        Guardar
                      </button>
                      <button className="sp-btn sp-btn-secondary" onClick={() => setEditingNotes(false)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Attempts */}
            <div>
              <div className="sp-card">
                <h3 className="sp-card-title">Historial de intentos</h3>
                {student.attempts.length === 0 ? (
                  <p style={{ color: 'var(--fg-2)', margin: '0' }}>Sin intentos aún</p>
                ) : (
                  <div className="sp-attempts">
                    {student.attempts.slice(0, 10).map((attempt) => (
                      <div
                        key={attempt.id}
                        className="sp-attempt-item"
                        style={{
                          borderLeft: `4px solid ${attempt.correct ? '#16a34a' : '#dc2626'}`,
                        }}
                      >
                        <div className="sp-attempt-icon">
                          {attempt.correct ? '✓' : '✗'}
                        </div>
                        <div className="sp-attempt-info">
                          <p className="sp-attempt-title">{attempt.skillName}</p>
                          <p className="sp-attempt-detail">
                            {attempt.expression} = {attempt.expectedAnswer}
                          </p>
                          <p className="sp-attempt-date">
                            {new Date(attempt.date).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
