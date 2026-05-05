'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface Skill {
  id: string
  key: string
  name: string
  description: string
  itemCount: number
}

export default function SkillsPage(): JSX.Element {
  const router = useRouter()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', key: '', description: '' })

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const response = await authClient.get('/skills')
        const data = (await response.json()) as Skill[]
        setSkills(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar habilidades')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('¿Eliminar esta habilidad?')) return

    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      await authClient.delete(`/skills/${id}`)
      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const handleCreate = async (): Promise<void> => {
    if (!formData.name || !formData.key) {
      setError('Nombre y clave son obligatorios')
      return
    }

    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      const response = await authClient.post('/skills', formData)
      const newSkill = (await response.json()) as Skill
      setSkills((prev) => [...prev, newSkill])
      setFormData({ name: '', key: '', description: '' })
      setShowNewForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear')
    }
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .sk-header { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 20px 24px; }
        .sk-header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .sk-title { font-size: 24px; font-weight: 700; margin: 0; }
        .sk-btn-new { padding: 8px 16px; background: var(--sky-600); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sk-btn-new:hover { background: var(--sky-700); }
        
        .sk-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
        
        /* Form */
        .sk-form { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 32px; }
        .sk-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .sk-label { font-size: 13px; font-weight: 600; }
        .sk-input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; font-family: inherit; }
        .sk-input:focus { outline: none; border-color: var(--sky-500); box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
        .sk-form-buttons { display: flex; gap: 8px; }
        .sk-btn { padding: 10px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sk-btn-primary { background: var(--sky-600); color: #fff; }
        .sk-btn-primary:hover { background: var(--sky-700); }
        .sk-btn-secondary { background: var(--border); color: var(--fg-1); }
        .sk-btn-secondary:hover { background: var(--bg-2); }
        
        /* Table */
        .sk-table-wrap { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; }
        .sk-table { width: 100%; border-collapse: collapse; }
        .sk-th, .sk-td { padding: 14px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }
        .sk-th { background: var(--bg-2); font-weight: 700; }
        .sk-tr:hover { background: var(--sky-50); }
        .sk-key { font-family: 'ui-monospace, monospace'; font-size: 12px; color: var(--fg-3); }
        .sk-actions { display: flex; gap: 8px; }
        .sk-btn-edit, .sk-btn-delete { padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sk-btn-edit:hover { background: var(--sky-100); border-color: var(--sky-300); color: var(--sky-700); }
        .sk-btn-delete:hover { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
        
        .sk-empty { text-align: center; padding: 60px 20px; color: var(--fg-2); }
        .sk-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .sk-empty-title { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: var(--fg-1); }
      `}</style>

      {/* Header */}
      <div className="sk-header">
        <div className="sk-header-inner">
          <h1 className="sk-title">Habilidades</h1>
          <button className="sk-btn-new" onClick={() => setShowNewForm(!showNewForm)}>
            {showNewForm ? '× Cancelar' : '+ Nueva habilidad'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="sk-container">
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', marginBottom: '20px' }}>{error}</div>}

        {showNewForm && (
          <div className="sk-form">
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Crear nueva habilidad</h3>
            <div className="sk-form-group">
              <label className="sk-label">Nombre</label>
              <input
                type="text"
                className="sk-input"
                placeholder="Ej: Resta con reserva"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="sk-form-group">
              <label className="sk-label">Clave</label>
              <input
                type="text"
                className="sk-input"
                placeholder="Ej: subtraction_borrow"
                value={formData.key}
                onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
              />
            </div>
            <div className="sk-form-group">
              <label className="sk-label">Descripción</label>
              <input
                type="text"
                className="sk-input"
                placeholder="Breve descripción..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="sk-form-buttons">
              <button className="sk-btn sk-btn-primary" onClick={() => void handleCreate()}>
                Crear
              </button>
              <button className="sk-btn sk-btn-secondary" onClick={() => setShowNewForm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading && <p>Cargando habilidades...</p>}

        {!loading && skills.length === 0 && (
          <div className="sk-empty">
            <div className="sk-empty-icon">🎯</div>
            <h3 className="sk-empty-title">Sin habilidades</h3>
            <p>Crea tu primera habilidad para comenzar</p>
          </div>
        )}

        {!loading && skills.length > 0 && (
          <div className="sk-table-wrap">
            <table className="sk-table">
              <thead>
                <tr>
                  <th className="sk-th">Nombre</th>
                  <th className="sk-th">Clave</th>
                  <th className="sk-th">Descripción</th>
                  <th className="sk-th">Ejercicios</th>
                  <th className="sk-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id} className="sk-tr">
                    <td className="sk-td" style={{ fontWeight: '600' }}>{skill.name}</td>
                    <td className="sk-key">{skill.key}</td>
                    <td className="sk-td">{skill.description}</td>
                    <td className="sk-td">{skill.itemCount}</td>
                    <td className="sk-td">
                      <div className="sk-actions">
                        <button
                          className="sk-btn-edit"
                          onClick={() => router.push(`/teacher/skills/${skill.id}/edit`)}
                        >
                          Editar
                        </button>
                        <button
                          className="sk-btn-delete"
                          onClick={() => void handleDelete(skill.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
