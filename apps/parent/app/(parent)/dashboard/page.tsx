'use client'

import { useEffect, useMemo, useState } from 'react'
import { AuthGuard } from '@shared/auth-guard'
import { getAccessToken } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { createApiClient } from '@shared/api-client'
import { MasteryBar } from '@components/MasteryBar'
import type { MasteryState } from '@shared/api-client'

const PARENT_ROLES = ['parent'] as const

function ParentDashboardContent(): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: runtimeConfig.apiUrl, getAccessToken }),
    [runtimeConfig.apiUrl],
  )

  const [skills, setSkills] = useState<MasteryState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgress(): Promise<void> {
      setLoading(true)
      setError('')
      try {
        const profile = await apiClient.me()
        const studentId = profile.user.profileId
        if (!studentId) {
          setError('No hay ningún alumno vinculado a tu cuenta de apoderado.')
          setLoading(false)
          return
        }
        const mastery = await apiClient.getMastery(studentId)
        setSkills(mastery)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información')
      } finally {
        setLoading(false)
      }
    }
    void loadProgress()
  }, [apiClient])

  const dominatedCount = skills.filter((s) => s.pKnown >= 0.7).length
  const avgMastery =
    skills.length > 0 ? skills.reduce((sum, s) => sum + s.pKnown, 0) / skills.length : 0

  return (
    <main className="page-container">
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--fg-1)',
            margin: 0,
          }}
        >
          Progreso matemático
        </h1>
        <p
          style={{
            color: 'var(--fg-2)',
            marginTop: 'var(--sp-1)',
            fontSize: 'var(--text-body-sm)',
          }}
        >
          Así va el aprendizaje de tu hijo/a en matemáticas.
        </p>
      </div>

      {loading ? <p style={{ color: 'var(--fg-3)' }}>Cargando información...</p> : null}

      {!loading && error ? (
        <div
          role="alert"
          style={{
            padding: 'var(--sp-4)',
            background: 'rgba(216,96,96,0.08)',
            border: '1px solid rgba(216,96,96,0.25)',
            borderRadius: 'var(--r-md)',
            color: 'var(--mastery-weak, #D86060)',
          }}
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && skills.length > 0 ? (
        <>
          {/* Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--sp-4)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            <div
              style={{
                background: 'var(--sky-500)',
                borderRadius: 'var(--r-xl)',
                padding: 'var(--sp-5)',
                color: '#fff',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  opacity: 0.8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Dominio promedio
              </div>
              <div
                style={{
                  fontSize: 'var(--text-display-3)',
                  fontWeight: 900,
                  marginTop: 4,
                }}
              >
                {Math.round(avgMastery * 100)}%
              </div>
            </div>

            <div
              style={{
                background: 'var(--mint-50)',
                border: '1px solid var(--mint-200)',
                borderRadius: 'var(--r-xl)',
                padding: 'var(--sp-5)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  color: 'var(--mint-700)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Habilidades dominadas
              </div>
              <div
                style={{
                  fontSize: 'var(--text-display-3)',
                  fontWeight: 900,
                  color: 'var(--mint-600)',
                  marginTop: 4,
                }}
              >
                {dominatedCount} / {skills.length}
              </div>
            </div>
          </div>

          {/* Skills list */}
          <div
            style={{
              background: 'var(--bg)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
              padding: 'var(--sp-6)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--fg-1)',
                margin: '0 0 var(--sp-5)',
              }}
            >
              Progreso por habilidad
            </h2>
            {skills.map((skill) => (
              <MasteryBar
                key={skill.skillKey}
                pKnown={skill.pKnown}
                label={skill.skillLabel ?? skill.skillKey}
              />
            ))}
          </div>

          {/* Privacy note */}
          <div
            style={{
              marginTop: 'var(--sp-6)',
              padding: 'var(--sp-4)',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--r-lg)',
              fontSize: 'var(--text-caption)',
              color: 'var(--fg-3)',
              display: 'flex',
              gap: 'var(--sp-2)',
              alignItems: 'flex-start',
            }}
          >
            <span>🔒</span>
            <span>
              Los datos de tu hijo/a son privados y no se comparten con terceros. Cumplimos con la
              Ley 21.180 y COPPA.
            </span>
          </div>
        </>
      ) : null}

      {!loading && !error && skills.length === 0 ? (
        <p style={{ color: 'var(--fg-2)' }}>Tu hijo/a aún no ha registrado intentos.</p>
      ) : null}
    </main>
  )
}

export default function ParentDashboardPage(): JSX.Element {
  return (
    <AuthGuard allowedRoles={PARENT_ROLES} loginPath="/login">
      <ParentDashboardContent />
    </AuthGuard>
  )
}
