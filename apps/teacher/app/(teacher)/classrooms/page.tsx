'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClassrooms, type ClassroomRecord } from '@/lib/api'

interface ClassroomWithStats extends ClassroomRecord {
  studentCount?: number
  masteryAvg?: number
}

export default function ClassroomsPage(): JSX.Element {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<ClassroomWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const data = await getClassrooms()
        const withStats = (data as ClassroomRecord[]).map((c: ClassroomRecord) => ({
          ...c,
          studentCount: Math.floor(Math.random() * 10) + 2,
          masteryAvg: Math.random() * 0.8 + 0.2,
        }))
        setClassrooms(withStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cursos')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filtered = classrooms.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ background: 'var(--bg-student,#EEF7FC)', minHeight: '100vh' }}>
      <style>{`
        .t-classrooms-header { position: sticky; top: 0; z-index: 10; background: rgba(240, 247, 251, 0.94); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; gap: 16px; align-items: center; }
        .t-cr-search { flex: 1; max-width: 300px; }
        .t-cr-search input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); font-size: 14px; font-family: inherit; }
        .t-cr-search input:focus { outline: 2px solid var(--sky-500); border-color: var(--sky-500); }
        .t-cr-btn { padding: 10px 20px; border-radius: 10px; border: 0; background: var(--sky-600); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; }
        .t-cr-shell { max-width: 1200px; margin: 0 auto; padding: 28px 20px 60px; }
        .t-cr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .t-cr-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 20px; cursor: pointer; transition: box-shadow 0.2s; }
        .t-cr-card:hover { box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08); }
        .t-cr-card-name { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
        .t-cr-card-sub { font-size: 13px; color: var(--fg-2); margin-bottom: 10px; }
        .t-cr-code { background: var(--sky-50); border: 1px solid var(--sky-200); border-radius: 10px; padding: 8px 12px; marginBottom: 12px; fontFamily: 'ui-monospace, monospace'; fontSize: 13; fontWeight: 700; color: var(--sky-700); }
        .t-cr-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; background: var(--sky-100); color: var(--sky-800); font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .t-cr-stats { display: flex; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
        .t-cr-stat { display: flex; align-items: center; gap: 6px; font-size: 13px; }
        .t-cr-stat-val { font-weight: 700; color: var(--sky-600); }
      `}</style>

      <div className="t-classrooms-header">
        <div className="t-cr-search">
          <input
            type="text"
            placeholder="Buscar curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="t-cr-btn" onClick={() => router.push('/classrooms/new')}>+ Crear curso</button>
      </div>

      <div className="t-cr-shell">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700 }}>Mis cursos</h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 15, margin: 0 }}>{filtered.length} cursos activos</p>
        </div>

        {loading && <p style={{ color: 'var(--fg-2)' }}>Cargando...</p>}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, color: '#7A2E2E' }}>
            {error}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fg-2)', padding: '60px 20px' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Sin cursos</p>
            <p>Crea tu primer curso o importa una clase existente.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="t-cr-grid">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="t-cr-card"
                onClick={() => router.push(`/classrooms/${c.id}`)}
              >
                <div style={{ marginBottom: 12 }}>
                  <div className="t-cr-card-name">{c.name}</div>
                  <div className="t-cr-card-sub">Primer semestre 2026 · Colegio San Pedro</div>
                  <div className="t-cr-card-sub" style={{ marginTop: 4 }}>{c.studentCount} alumnos · 4° básico</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fg-2)', marginBottom: 8 }}>
                  Código de invitación
                </div>
                <div style={{ background: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, fontFamily: 'ui-monospace, monospace', fontSize: 14, fontWeight: 700, color: 'var(--sky-700)', textAlign: 'center' }}>
                  {`${c.name.split(' · ')[0]?.slice(0, 1)}-${c.name.split(' · ')[1]?.slice(0, 3).toUpperCase() || 'MAT'}-X7`}
                </div>
                <div style={{ display: 'flex', gap: 6, fontSize: 12, marginBottom: 12 }}>
                  <button style={{ flex: 1, padding: '6px 8px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'var(--sky-600)', fontSize: 12, fontFamily: 'inherit' }}>
                    Copiar
                  </button>
                  <button style={{ flex: 1, padding: '6px 8px', background: 'var(--sky-100)', border: '1px solid var(--sky-200)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'var(--sky-700)', fontSize: 12, fontFamily: 'inherit' }}>
                    + Nuevo
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button style={{ padding: '8px 12px', background: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--sky-700)', fontFamily: 'inherit', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sky-100)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sky-50)' }}>
                    Heatmap
                  </button>
                  <button style={{ padding: '8px 12px', background: 'var(--sky-600)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sky-700)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sky-600)' }}>
                    Asignar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
