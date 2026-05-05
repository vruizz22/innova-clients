'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyStudentClassrooms, joinClassroom, type ClassroomRecord } from '@/lib/api'

interface ClassroomWithCode extends ClassroomRecord {
  inviteCode?: string
  members?: Array<{ id: string; email: string }>
}

export default function ClassroomPage(): JSX.Element {
  const router = useRouter()
  const [classroom, setClassroom] = useState<ClassroomWithCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const classrooms = await getMyStudentClassrooms()
        if (classrooms.length > 0) {
          setClassroom(classrooms[0] as ClassroomWithCode)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el curso.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  async function handleJoin(): Promise<void> {
    if (!code.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      const result = await joinClassroom(code.trim().toUpperCase())
      setClassroom({ id: result.id, name: result.name, description: null, schoolId: null, createdAt: '', updatedAt: '' })
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'No se pudo unir al curso.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <>
      <style>{`
        .join-box { background: var(--mint-50,#EDFAF5); border: 1px solid var(--mint-200,#A7E8D0); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 14px; max-width: 420px; margin-top: 24px; }
        .join-input { display: flex; gap: 8px; }
        .join-input input { flex: 1; padding: 11px 14px; border-radius: 10px; border: 1.5px solid var(--border-strong,#9AAFBE); font-family: ui-monospace, monospace; font-size: 16px; letter-spacing: .1em; text-transform: uppercase; }
        .join-input input:focus { outline: 2px solid var(--sky-400,#3FA7D6); border-color: var(--sky-400,#3FA7D6); }
        .join-btn { padding: 11px 20px; border-radius: 10px; border: 0; background: var(--sky-600,#2887B0); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; white-space: nowrap; font-family: inherit; }
        .join-btn:disabled { opacity: .6; cursor: not-allowed; }
        .cr-shell { max-width: 600px; margin: 0 auto; padding: 28px 20px 60px; }
        .cr-back { font-size: 14px; font-weight: 600; color: var(--sky-600,#2887B0); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 20px; }
        .cr-back:hover { text-decoration: underline; }
        .cr-card { background: #fff; border: 1px solid var(--border,#D9E3EA); border-radius: 14px; padding: 24px; }
        .cr-invite { font-family: ui-monospace, monospace; font-size: 28px; font-weight: 800; letter-spacing: .15em; color: var(--sky-700,#1E6FA5); background: var(--sky-50,#EFF9FF); border: 2px solid var(--sky-200,#BAE6FD); border-radius: 10px; padding: 10px 20px; text-align: center; }
      `}</style>

      <div className="cr-shell" style={{ background: 'var(--bg-student,#EEF7FC)', minHeight: '100vh' }}>
        <a href="/dashboard" className="cr-back">← Volver</a>
        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>Mi curso</h1>
        <p style={{ color: 'var(--fg-2,#667080)', fontSize: 15, margin: '0 0 20px' }}>
          Información de tu clase.
        </p>

        {loading && (
          <p style={{ color: 'var(--fg-2)' }}>Cargando...</p>
        )}

        {!loading && error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, color: '#7A2E2E' }} role="alert">
            {error}
          </div>
        )}

        {!loading && !error && classroom && (
          <div className="cr-card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fg-2)', marginBottom: 4 }}>Nombre del curso</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{classroom.name}</div>
            </div>
            {classroom.inviteCode && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fg-2)', marginBottom: 8 }}>Código de invitación</div>
                <div className="cr-invite">{classroom.inviteCode}</div>
              </div>
            )}
            {classroom.members && classroom.members.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fg-2)', marginBottom: 8 }}>
                  Compañeros · {classroom.members.length}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {classroom.members.map((m) => (
                    <div key={m.id} style={{ padding: '8px 12px', background: 'var(--sky-50,#EFF9FF)', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                      {m.email}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !classroom && (
          <div className="join-box">
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Únete a tu curso</div>
              <div style={{ fontSize: 14, color: 'var(--fg-2,#667080)' }}>Ingresa el código que te dio tu profe para unirte a la clase.</div>
            </div>
            <div className="join-input">
              <input
                type="text"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={10}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleJoin() }}
              />
              <button className="join-btn" onClick={() => void handleJoin()} disabled={joining || code.trim() === ''} type="button">
                {joining ? '...' : 'Unirme'}
              </button>
            </div>
            {joinError && (
              <p style={{ color: '#7A2E2E', fontSize: 14, margin: 0 }} role="alert">{joinError}</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
