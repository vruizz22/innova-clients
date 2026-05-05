'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { getAccessToken, getDashboardUrl, getStoredSession, storeSession } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import {
  createApiClient,
  type ConfirmForgotPasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
} from '@components/api-client'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

type AuthPageProps = {
  title: string
  mode: AuthMode
  defaultRole?: RegisterInput['role']
  allowedRoles?: RegisterInput['role'][]
}

type AllowedRole = RegisterInput['role']

const ROLE_LABELS: Record<AllowedRole, string> = {
  student: 'Alumno',
  teacher: 'Profe',
  parent: 'Apoderado',
}

const DEFAULT_ALLOWED_ROLES: RegisterInput['role'][] = ['student', 'teacher', 'parent']

export function AuthPage({
  title,
  mode,
  defaultRole = 'student',
  allowedRoles = DEFAULT_ALLOWED_ROLES,
}: AuthPageProps): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const baseUrl = runtimeConfig.apiUrl
  const authClient = useMemo(() => createApiClient({ baseUrl }), [baseUrl])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' })
  const [registerData, setRegisterData] = useState<RegisterInput>({
    email: '',
    password: '',
    role: defaultRole,
  })
  const [forgotData, setForgotData] = useState<ForgotPasswordInput>({ email: '' })
  const [resetData, setResetData] = useState<ConfirmForgotPasswordInput>({
    email: '',
    code: '',
    newPassword: '',
  })

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
      })
  }, [baseUrl, mode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (mode === 'login') {
        const result = await authClient.login(loginData)
        storeSession(result)
        window.location.href = getDashboardUrl(result.user.role)
        return
      }
      if (mode === 'register') {
        const result = await authClient.register(registerData)
        storeSession(result)
        window.location.href = getDashboardUrl(result.user.role)
        return
      }
      if (mode === 'forgot') {
        const result = await authClient.forgotPassword(forgotData)
        setMessage(result.message ?? 'Código enviado. Revisa tu correo.')
        return
      }
      const result = await authClient.confirmForgotPassword(resetData)
      setMessage(result.message ?? 'Contraseña restablecida correctamente.')
    } catch (requestError) {
      setMessage(
        requestError instanceof Error ? requestError.message : 'Error de autenticación',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-main">
      <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">
            {mode === 'login' && 'Ingresa con tu correo y contraseña.'}
            {mode === 'register' && 'Crea tu cuenta en segundos.'}
            {mode === 'forgot' && 'Te enviaremos un código de recuperación.'}
            {mode === 'reset' && 'Ingresa el código que recibiste por correo.'}
          </p>

          {/* Role chooser — only for register */}
          {mode === 'register' && allowedRoles.length > 1 ? (
            <div className="auth-roles">
              {allowedRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  className="auth-role"
                  aria-pressed={registerData.role === role}
                  onClick={() => setRegisterData((prev) => ({ ...prev, role }))}
                >
                  {role === 'student' ? '📚' : role === 'teacher' ? '👩‍🏫' : '👨‍👩‍👧'}
                  <span>{ROLE_LABELS[role] ?? role}</span>
                </button>
              ))}
            </div>
          ) : null}

          {message ? (
            <div className="auth-error-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              {message}
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Login fields */}
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
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((prev) => ({ ...prev, email: e.target.value }))
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
                    onChange={(e) =>
                      setLoginData((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <a className="auth-link" href="/forgot" style={{ fontSize: 13 }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </>
            ) : null}

            {/* Register fields */}
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
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, email: e.target.value }))
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
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>
              </>
            ) : null}

            {/* Forgot password */}
            {mode === 'forgot' ? (
              <div className="auth-row">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                  value={forgotData.email}
                  onChange={(e) => setForgotData({ email: e.target.value })}
                />
              </div>
            ) : null}

            {/* Reset password */}
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
                    onChange={(e) =>
                      setResetData((prev) => ({ ...prev, email: e.target.value }))
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
                    onChange={(e) =>
                      setResetData((prev) => ({ ...prev, code: e.target.value }))
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
                    onChange={(e) =>
                      setResetData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                  />
                </div>
              </>
            ) : null}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Enviando...' : mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta' : 'Continuar'}
            </button>
          </form>

          <div className="auth-foot">
            {mode === 'login' ? (
              <>¿No tienes cuenta? <a className="auth-link" href="/register">Regístrate gratis</a></>
            ) : (
              <>¿Ya tienes cuenta? <a className="auth-link" href="/login">Ingresar</a></>
            )}
          </div>
      </div>
    </main>
  )
}
