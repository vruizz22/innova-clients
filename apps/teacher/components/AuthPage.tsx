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
} from './api-client'

type InputChangeEvent = {
  target: {
    value: string
  }
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

type AuthPageProps = {
  title: string
  mode: AuthMode
}

export function AuthPage({ title, mode }: AuthPageProps): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const baseUrl = runtimeConfig.apiUrl
  const authClient = useMemo(() => createApiClient({ baseUrl }), [baseUrl])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' })
  const [registerData, setRegisterData] = useState<RegisterInput>({ email: '', password: '', role: 'teacher' })
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
        setMessage(result.message ?? 'Recovery code requested.')
        return
      }

      const result = await authClient.confirmForgotPassword(resetData)
      setMessage(result.message ?? 'Password reset completed.')
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'Unknown auth error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-main">
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">
          {mode === 'login' ? 'Ingresa con tu correo y contraseña.' : null}
          {mode === 'register' ? 'Crea tu cuenta de profesor.' : null}
          {mode === 'forgot' ? 'Te enviaremos un código de recuperación.' : null}
          {mode === 'reset' ? 'Ingresa el código que recibiste por correo.' : null}
        </p>

        {message ? (
          <div className="auth-error-banner" role="alert" style={{ marginBottom: 16 }}>
            {message}
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
                  placeholder="profe@colegio.cl"
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
              <div style={{ textAlign: 'right' }}>
                <a className="auth-link" href="/forgot" style={{ fontSize: 13 }}>
                  ¿Olvidaste tu contraseña?
                </a>
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
                  placeholder="profe@colegio.cl"
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

          {mode === 'forgot' ? (
            <div className="auth-row">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                required
                placeholder="profe@colegio.cl"
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

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta' : 'Continuar'}
          </button>
        </form>

        <div className="auth-foot">
          {mode === 'login' ? (
            <>¿No tienes cuenta? <a className="auth-link" href="/register">Regístrate</a></>
          ) : (
            <>¿Ya tienes cuenta? <a className="auth-link" href="/login">Ingresar</a></>
          )}
        </div>
      </div>
    </main>
  )
}
