'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createApiClient } from '@shared/api-client'
import { getAccessToken } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface ParentProfile {
  id: string
  name: string
  email: string
  role: string
  studentsCount: number
}

export default function ParentProfilePage(): JSX.Element {
  const router = useRouter()
  const [profile, setProfile] = useState<ParentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const config = getPublicRuntimeConfig()
        const client = createApiClient({ baseUrl: config.apiUrl, getAccessToken })
        const response = await client.get('/auth/me')
        const data = (await response.json()) as ParentProfile
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  function handleLogout(): void {
    localStorage.removeItem('innova.auth.session')
    router.push('/auth/login')
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .pp-container { max-width: 600px; margin: 0 auto; padding: 24px; }
        .pp-header { margin-bottom: 32px; }
        .pp-title { font-size: 28px; font-weight: 700; margin: 0; }
        
        .pp-section { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .pp-section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: var(--fg-3); margin: 0 0 12px; }
        
        /* Avatar */
        .pp-avatar-section { text-align: center; padding: 24px; }
        .pp-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--sky-500); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto 16px; }
        .pp-name { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
        .pp-role { font-size: 13px; color: var(--fg-2); margin: 0; }
        
        /* Info */
        .pp-info-grid { display: grid; gap: 12px; }
        .pp-info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-2); border-radius: 8px; }
        .pp-info-label { font-size: 13px; color: var(--fg-2); font-weight: 600; }
        .pp-info-value { font-size: 13px; font-weight: 600; color: var(--fg-1); }
        
        /* Buttons */
        .pp-button-group { display: flex; flex-direction: column; gap: 8px; }
        .pp-button { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: transparent; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .pp-button:hover { background: var(--bg-2); }
        .pp-button.primary { background: var(--sky-600); color: #fff; border-color: var(--sky-600); }
        .pp-button.primary:hover { background: var(--sky-700); }
        .pp-button.danger { color: #dc2626; }
        .pp-button.danger:hover { background: #fee2e2; border-color: #fecaca; }
      `}</style>

      <div className="pp-container">
        {/* Header */}
        <div className="pp-header">
          <h1 className="pp-title">Mi perfil</h1>
        </div>

        {loading && <p>Cargando perfil...</p>}
        {error && (
          <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <>
            {/* Avatar & Name */}
            <div className="pp-section pp-avatar-section">
              <div className="pp-avatar">{profile.name.charAt(0).toUpperCase()}</div>
              <p className="pp-name">{profile.name}</p>
              <p className="pp-role">{profile.role === 'parent' ? 'Apoderado' : profile.role}</p>
            </div>

            {/* Information */}
            <div className="pp-section">
              <h2 className="pp-section-title">Información</h2>
              <div className="pp-info-grid">
                <div className="pp-info-row">
                  <span className="pp-info-label">Correo</span>
                  <span className="pp-info-value">{profile.email}</span>
                </div>
                <div className="pp-info-row">
                  <span className="pp-info-label">Estudiantes</span>
                  <span className="pp-info-value">{profile.studentsCount}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pp-section">
              <h2 className="pp-section-title">Acciones</h2>
              <div className="pp-button-group">
                <button
                  className="pp-button primary"
                  onClick={() => router.push('/settings')}
                >
                  Ajustes
                </button>
                <button className="pp-button danger" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
