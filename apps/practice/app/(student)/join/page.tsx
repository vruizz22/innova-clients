'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

export default function JoinClassroomPage(): JSX.Element {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleJoin(): Promise<void> {
    if (!code.trim()) {
      setError('Ingresa un código válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      const response = await authClient.post('/classrooms/student/join', { code })
      if (!response.ok) {
        throw new Error('Código no válido o ya estás en este curso')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/student/dashboard')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al curso')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      void handleJoin()
    }
  }

  return (
    <main style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`
        .j-card { background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); max-width: 420px; width: 100%; padding: 40px; }
        .j-header { text-align: center; margin-bottom: 32px; }
        .j-icon { font-size: 48px; margin-bottom: 16px; }
        .j-title { font-size: 24px; font-weight: 700; color: var(--fg-1); margin: 0 0 8px; }
        .j-subtitle { font-size: 14px; color: var(--fg-2); margin: 0; }
        .j-form { display: flex; flex-direction: column; gap: 16px; }
        .j-input-group { display: flex; flex-direction: column; gap: 8px; }
        .j-label { font-size: 14px; font-weight: 600; color: var(--fg-1); }
        .j-input { padding: 12px 14px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; font-family: 'ui-monospace, monospace'; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; }
        .j-input:focus { outline: none; border-color: var(--sky-500); box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
        .j-input::placeholder { color: var(--fg-3); }
        .j-btn { padding: 12px 16px; background: var(--sky-600); color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .j-btn:hover:not(:disabled) { background: var(--sky-700); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }
        .j-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .j-error { padding: 12px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 14px; text-align: center; }
        .j-success { padding: 12px; background: #d1fae5; border: 1px solid #86efac; border-radius: 8px; color: #065f46; font-size: 14px; text-align: center; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .j-helper { font-size: 13px; color: var(--fg-3); text-align: center; margin-top: 16px; }
        .j-helper a { color: var(--sky-600); text-decoration: none; font-weight: 600; }
        .j-helper a:hover { text-decoration: underline; }
      `}</style>

      <div className="j-card">
        <div className="j-header">
          <div className="j-icon">🎓</div>
          <h1 className="j-title">Unirme a un curso</h1>
          <p className="j-subtitle">Ingresa el código que tu profesor/a te proporcionó</p>
        </div>

        <div className="j-form">
          <div className="j-input-group">
            <label className="j-label" htmlFor="code">Código del curso</label>
            <input
              id="code"
              type="text"
              className="j-input"
              placeholder="Ej: 4A-MAT-X7"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading || success}
            />
          </div>

          {error && <div className="j-error">{error}</div>}
          {success && <div className="j-success">✓ ¡Te uniste al curso! Redirigiendo...</div>}

          <button
            className="j-btn"
            onClick={() => void handleJoin()}
            disabled={loading || success || !code.trim()}
          >
            {loading ? 'Verificando...' : 'Unirme al curso'}
          </button>
        </div>

        <p className="j-helper">
          ¿No tienes código? Contacta a tu profesor/a o{' '}
          <a href="/student/dashboard">vuelve al dashboard</a>
        </p>
      </div>
    </main>
  )
}
