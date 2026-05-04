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
  type UserRole,
} from '@components/api-client'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

type AuthPageProps = {
  title: string
  mode: AuthMode
  defaultRole?: RegisterInput['role']
  allowedRoles?: RegisterInput['role'][]
}

const DEFAULT_ALLOWED_ROLES: RegisterInput['role'][] = ['student', 'parent']

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
  const [registerData, setRegisterData] = useState<RegisterInput>({ email: '', password: '', role: defaultRole })
  const [forgotData, setForgotData] = useState<ForgotPasswordInput>({ email: '' })
  const [resetData, setResetData] = useState<ConfirmForgotPasswordInput>({ email: '', code: '', newPassword: '' })

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
        setMessage(result.message ?? 'Código de recuperación enviado.')
        return
      }

      const result = await authClient.confirmForgotPassword(resetData)
      setMessage(result.message ?? 'Contraseña restablecida correctamente.')
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'Error de autenticación desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <section className="card auth-shell">
        <div className="auth-head">
          <p className="auth-eyebrow">SuperProfes</p>
          <h1>{title}</h1>
          <p>Ingresa con tu cuenta para continuar.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <>
              <label>
                Email
                <input
                  value={loginData.email}
                  onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  required
                  placeholder="tu@email.com"
                />
              </label>
              <label>
                Contraseña
                <input
                  value={loginData.password}
                  onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </label>
            </>
          ) : null}

          {mode === 'register' ? (
            <>
              <label>
                Email
                <input
                  value={registerData.email}
                  onChange={(event) => setRegisterData((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  required
                  placeholder="tu@email.com"
                />
              </label>
              <label>
                Contraseña
                <input
                  value={registerData.password}
                  onChange={(event) => setRegisterData((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </label>
              <label>
                Tipo de cuenta
                <select
                  value={registerData.role}
                  onChange={(event) => {
                    const nextRole = event.target.value as UserRole
                    if (nextRole === 'student' || nextRole === 'teacher' || nextRole === 'parent') {
                      setRegisterData((current) => ({ ...current, role: nextRole }))
                    }
                  }}
                >
                  {allowedRoles.map((role) => (
                    <option key={role} value={role}>
                      {role === 'student' ? 'Alumno' : role === 'teacher' ? 'Profesor' : 'Apoderado'}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {mode === 'forgot' ? (
            <label>
              Email
              <input
                value={forgotData.email}
                onChange={(event) => setForgotData({ email: event.target.value })}
                type="email"
                required
                placeholder="tu@email.com"
              />
            </label>
          ) : null}

          {mode === 'reset' ? (
            <>
              <label>
                Email
                <input
                  value={resetData.email}
                  onChange={(event) => setResetData((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  required
                />
              </label>
              <label>
                Código de recuperación
                <input
                  value={resetData.code}
                  onChange={(event) => setResetData((current) => ({ ...current, code: event.target.value }))}
                  type="text"
                  required
                />
              </label>
              <label>
                Nueva contraseña
                <input
                  value={resetData.newPassword}
                  onChange={(event) => setResetData((current) => ({ ...current, newPassword: event.target.value }))}
                  type="password"
                  required
                />
              </label>
            </>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Continuar'}
          </button>
        </form>

        <p className="auth-message">
          {message || 'Tus datos se validan contra SuperProfes.'}
        </p>
        {mode !== 'login' ? (
          <p className="auth-message">
            <a className="auth-link-inline" href="/login">Ya tengo cuenta</a>
          </p>
        ) : null}
      </section>
    </main>
  )
}
