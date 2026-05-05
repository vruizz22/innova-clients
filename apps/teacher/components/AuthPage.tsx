'use client'

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import React from 'react'

import { getAccessToken, getDashboardUrl, getStoredSession, storeSession } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import {
  createApiClient,
  type ConfirmForgotPasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type UserRole,
} from './api-client'

type InputChangeEvent = { target: { value: string } }
type AuthMode = 'login' | 'forgot' | 'reset' | 'register'
type SelectedRole = 'student' | 'teacher' | 'parent'

type AuthPageProps = {
  title: string
  mode: AuthMode
  defaultRole?: SelectedRole
}

const ROLE_LABELS: Record<SelectedRole, string> = {
  student: 'Estudiante',
  teacher: 'Profesor/a',
  parent: 'Apoderado/a',
}

const ROLE_ICONS: Record<SelectedRole, React.ReactNode> = {
  student: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  teacher: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/></svg>,
  parent: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
}

export function AuthPage({ title, mode, defaultRole = 'teacher' }: AuthPageProps): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const baseUrl = runtimeConfig.apiUrl
  const authClient = useMemo(() => createApiClient({ baseUrl }), [baseUrl])
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(defaultRole)

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' })
  const [forgotData, setForgotData] = useState<ForgotPasswordInput>({ email: '' })
  const [resetData, setResetData] = useState<ConfirmForgotPasswordInput>({ email: '', code: '', newPassword: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [registerData, setRegisterData] = useState<RegisterInput>({ email: '', password: '', role: defaultRole })

  useEffect(() => {
    if (mode !== 'login') return
    const session = getStoredSession()
    if (!session) return

    const meClient = createApiClient({ baseUrl, getAccessToken })
    void meClient
      .me()
      .then((profile) => {
        window.location.href = getDashboardUrl(profile.user.role)
      })
      .catch(() => {
        setMessage('Tu sesión expiró. Ingresa nuevamente.')
        setIsError(true)
      })
  }, [baseUrl, mode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      if (mode === 'login') {
        const result = await authClient.login(loginData)

        // Role mismatch check
        const actualRole = result.user.role as UserRole
        if (actualRole !== selectedRole && actualRole !== 'admin') {
          setMessage(
            `Tu cuenta es de tipo "${ROLE_LABELS[actualRole as SelectedRole] ?? actualRole}". Usa el acceso correspondiente.`
          )
          setIsError(true)
          setLoading(false)
          return
        }

        storeSession(result)
        window.location.href = getDashboardUrl(result.user.role)
        return
      }

      if (mode === 'forgot') {
        const result = await authClient.forgotPassword(forgotData)
        setMessage(result.message ?? 'Se envió el código de recuperación a tu correo.')
        setIsError(false)
        return
      }

      if (mode === 'reset') {
        const result = await authClient.confirmForgotPassword(resetData)
        setMessage(result.message ?? 'Contraseña actualizada correctamente.')
        setIsError(false)
        return
      }

      if (mode === 'register') {
        const result = await authClient.register(registerData)
        storeSession(result)
        window.location.href = getDashboardUrl(result.user.role)
        return
      }
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'Error de autenticación')
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      {/* ── Left aside — brand panel ─────────────────────── */}
      <aside className="auth-aside">
        <div className="auth-brand">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>SP</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>SuperProfes</span>
        </div>

        <div className="auth-pitch">
          <h2>Aprende matemáticas con inteligencia artificial</h2>
          <p>Detectamos errores procedimentales y adaptamos la práctica para cada estudiante en tiempo real.</p>
          <div className="auth-pitch-foot">
            <span className="dot" />
            <span>Para alumnos, profesores y apoderados</span>
          </div>
        </div>
      </aside>

      {/* ── Right form area ──────────────────────────────── */}
      <main className="auth-main">
        <div className="auth-card">
          {/* Mobile logo */}
          <div className="auth-logo-mobile">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--sky-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 12 }}>SP</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--fg-1)' }}>SuperProfes</span>
          </div>

          {mode === 'login' ? (
            <>
              <h1 className="auth-title">Bienvenido de vuelta</h1>
              <p className="auth-sub">Selecciona tu rol e ingresa tus credenciales.</p>

              {/* Role chooser */}
              <div className="auth-roles" role="group" aria-label="Selecciona tu rol">
                {(['student', 'teacher', 'parent'] as SelectedRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="auth-role"
                    aria-pressed={selectedRole === role}
                    onClick={() => {
                      const roleUrls: Record<SelectedRole, string> = { student: 'http://localhost:3002/login', teacher: 'http://localhost:3001/login', parent: 'http://localhost:3003/login' }
                      if (role !== defaultRole) {
                        window.location.href = roleUrls[role]
                        return
                      }
                      setSelectedRole(role)
                    }}
                  >
                    <span aria-hidden="true">{ROLE_ICONS[role]}</span>
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {mode === 'forgot' ? (
            <>
              <h1 className="auth-title">Recuperar contraseña</h1>
              <p className="auth-sub">Te enviaremos un código de recuperación a tu correo.</p>
            </>
          ) : null}

          {mode === 'reset' ? (
            <>
              <h1 className="auth-title">Nueva contraseña</h1>
              <p className="auth-sub">Ingresa el código que recibiste y tu nueva contraseña.</p>
            </>
          ) : null}

          {message ? (
            <div
              className={isError ? 'auth-error-banner' : 'auth-email-sent'}
              role="alert"
              style={{ marginBottom: 16 }}
            >
              {!isError ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
              <span>{message}</span>
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'login' ? (
              <>
                <div className="auth-row">
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    className="auth-input"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={selectedRole === 'teacher' ? 'profe@colegio.cl' : selectedRole === 'parent' ? 'apoderado@mail.cl' : 'alumno@colegio.cl'}
                    value={loginData.email}
                    onChange={(event: InputChangeEvent) =>
                      setLoginData((current: LoginInput) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                <div className="auth-row">
                  <label htmlFor="auth-password">Contraseña</label>
                  <input
                    id="auth-password"
                    className="auth-input"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(event: InputChangeEvent) =>
                      setLoginData((current: LoginInput) => ({ ...current, password: event.target.value }))
                    }
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="auth-row-checkbox" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 500 }}>Recordarme</span>
                  </label>
                  <a className="auth-link" href="/forgot" style={{ fontSize: 13 }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </>
            ) : null}

            {mode === 'forgot' ? (
              <div className="auth-row">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="correo@ejemplo.cl"
                  value={forgotData.email}
                  onChange={(event: InputChangeEvent) => setForgotData({ email: event.target.value })}
                />
              </div>
            ) : null}

            {mode === 'reset' ? (
              <>
                <div className="auth-row">
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    className="auth-input"
                    type="email"
                    required
                    value={resetData.email}
                    onChange={(event: InputChangeEvent) =>
                      setResetData((current: ConfirmForgotPasswordInput) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                <div className="auth-row">
                  <label htmlFor="auth-code">Código de recuperación</label>
                  <input
                    id="auth-code"
                    className="auth-input"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="123456"
                    value={resetData.code}
                    onChange={(event: InputChangeEvent) =>
                      setResetData((current: ConfirmForgotPasswordInput) => ({ ...current, code: event.target.value }))
                    }
                  />
                </div>
                <div className="auth-row">
                  <label htmlFor="auth-newpw">Nueva contraseña</label>
                  <input
                    id="auth-newpw"
                    className="auth-input"
                    type="password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={resetData.newPassword}
                    onChange={(event: InputChangeEvent) =>
                      setResetData((current: ConfirmForgotPasswordInput) => ({ ...current, newPassword: event.target.value }))
                    }
                  />
                </div>
              </>
            ) : null}

            {mode === 'register' ? (
              <>
                <div className="auth-row">
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    className="auth-input"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="correo@ejemplo.cl"
                    value={registerData.email}
                    onChange={(event: InputChangeEvent) =>
                      setRegisterData((current: RegisterInput) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                <div className="auth-row">
                  <label htmlFor="auth-password">Contraseña</label>
                  <input
                    id="auth-password"
                    className="auth-input"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={registerData.password}
                    onChange={(event: InputChangeEvent) =>
                      setRegisterData((current: RegisterInput) => ({ ...current, password: event.target.value }))
                    }
                  />
                </div>
              </>
            ) : null}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? mode === 'register'
                  ? 'Creando cuenta...'
                  : 'Ingresando...'
                : mode === 'register'
                  ? 'Crear cuenta'
                  : mode === 'login'
                    ? 'Entrar'
                    : 'Enviar'}
            </button>
          </form>

          {mode === 'login' ? (
            <p className="auth-foot">
              ¿Problemas para ingresar? <a className="auth-link" href="/forgot">Recupera tu contraseña</a>
            </p>
          ) : (
            <p className="auth-foot">
              <a className="auth-link" href="/login">Volver al inicio de sesión</a>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
