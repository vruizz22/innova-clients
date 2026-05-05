'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface Item {
  id: string
  expression: string
  a: number
  b: number
  c: number
  attemptsCount: number
  correctPercent: number
  skillId: string
  skillName: string
}

export default function ItemBankPage(): JSX.Element {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skillFilter, setSkillFilter] = useState<string>('')
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const itemsRes = await authClient.get('/items/teacher')
        const skillsRes = await authClient.get('/skills')

        const itemsData = (await itemsRes.json()) as Item[]
        const skillsData = (await skillsRes.json()) as { id: string; name: string }[]

        setItems(itemsData)
        setFilteredItems(itemsData)
        setSkills(skillsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar ejercicios')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  useEffect(() => {
    let filtered = items
    if (skillFilter) {
      filtered = items.filter((i) => i.skillId === skillFilter)
    }
    setFilteredItems(filtered)
  }, [skillFilter, items])

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .ib-header { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 20px 24px; }
        .ib-header-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .ib-title { font-size: 24px; font-weight: 700; margin: 0; flex: 1; }
        .ib-filter { display: flex; gap: 12px; align-items: center; }
        .ib-filter select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; background: var(--bg-1); color: var(--fg-1); cursor: pointer; }
        
        .ib-container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
        .ib-table-wrap { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; }
        .ib-table { width: 100%; border-collapse: collapse; }
        .ib-th, .ib-td { padding: 14px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }
        .ib-th { background: var(--bg-2); font-weight: 700; }
        .ib-tr:hover { background: var(--sky-50); }
        .ib-id { font-family: 'ui-monospace, monospace'; font-size: 12px; color: var(--fg-3); }
        .ib-expression { font-family: 'ui-monospace, monospace'; font-weight: 600; }
        .ib-param { text-align: center; }
        .ib-btn { padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ib-btn:hover { background: var(--sky-600); color: #fff; border-color: var(--sky-600); }
        
        .ib-empty { text-align: center; padding: 60px 20px; color: var(--fg-2); }
        .ib-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .ib-empty-title { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: var(--fg-1); }
      `}</style>

      {/* Header */}
      <div className="ib-header">
        <div className="ib-header-inner">
          <h1 className="ib-title">Banco de ejercicios</h1>
          <div className="ib-filter">
            <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
              <option value="">Todas las habilidades</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ib-container">
        {loading && <p>Cargando ejercicios...</p>}
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="ib-empty">
            <div className="ib-empty-icon">📋</div>
            <h3 className="ib-empty-title">Sin ejercicios</h3>
            <p>No hay ejercicios disponibles para este filtro</p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="ib-table-wrap">
            <table className="ib-table">
              <thead>
                <tr>
                  <th className="ib-th">ID</th>
                  <th className="ib-th">Expresión</th>
                  <th className="ib-th">Habilidad</th>
                  <th className="ib-th ib-param">Discriminación (a)</th>
                  <th className="ib-th ib-param">Dificultad (b)</th>
                  <th className="ib-th ib-param">Azar (c)</th>
                  <th className="ib-th ib-param">Intentos</th>
                  <th className="ib-th ib-param">% Correcto</th>
                  <th className="ib-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="ib-tr">
                    <td className="ib-id">{item.id.slice(0, 8)}</td>
                    <td className="ib-expression">{item.expression}</td>
                    <td>{item.skillName}</td>
                    <td className="ib-param">{item.a.toFixed(2)}</td>
                    <td className="ib-param">{item.b.toFixed(2)}</td>
                    <td className="ib-param">{item.c.toFixed(2)}</td>
                    <td className="ib-param">{item.attemptsCount}</td>
                    <td className="ib-param">
                      <span style={{ color: item.correctPercent >= 70 ? '#16a34a' : item.correctPercent >= 40 ? '#f59e0b' : '#dc2626', fontWeight: '600' }}>
                        {(item.correctPercent * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td>
                      <button
                        className="ib-btn"
                        onClick={() => router.push(`/teacher/items/${item.id}`)}
                      >
                        Ver
                      </button>
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
