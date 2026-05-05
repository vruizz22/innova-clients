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
    <main className="container">
      <section className="card auth-shell">
        <div className="auth-head">
          <a href={runtimeConfig.landingUrl} className="auth-brand">SuperProfes</a>
          <h1>{title}</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <>
              <label>
                Email
                <input value={loginData.email} onChange={(event: InputChangeEvent) => setLoginData((current: LoginInput) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                Password
                <input value={loginData.password} onChange={(event: InputChangeEvent) => setLoginData((current: LoginInput) => ({ ...current, password: event.target.value }))} type="password" required />
              </label>
            </>
          ) : null}

          {mode === 'register' ? (
            <>
              <label>
                Email
                <input value={registerData.email} onChange={(event: InputChangeEvent) => setRegisterData((current: RegisterInput) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                Password
                <input value={registerData.password} onChange={(event: InputChangeEvent) => setRegisterData((current: RegisterInput) => ({ ...current, password: event.target.value }))} type="password" required />
              </label>
              <label>
                Tipo de cuenta
                <select
                  value={registerData.role}
                  onChange={(event: InputChangeEvent) => {
                    const nextRole = event.target.value
                    if (nextRole === 'teacher' || nextRole === 'student' || nextRole === 'parent') {
                      setRegisterData((current: RegisterInput) => ({ ...current, role: nextRole }))
                    }
                  }}
                >
                  <option value="teacher">Profesor</option>
                  <option value="student">Alumno</option>
                  <option value="parent">Apoderado</option>
                </select>
              </label>
            </>
          ) : null}

          {mode === 'forgot' ? (
            <label>
              Email
              <input value={forgotData.email} onChange={(event: InputChangeEvent) => setForgotData({ email: event.target.value })} type="email" required />
            </label>
          ) : null}

          {mode === 'reset' ? (
            <>
              <label>
                Email
                <input value={resetData.email} onChange={(event: InputChangeEvent) => setResetData((current: ConfirmForgotPasswordInput) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                Recovery code
                <input value={resetData.code} onChange={(event: InputChangeEvent) => setResetData((current: ConfirmForgotPasswordInput) => ({ ...current, code: event.target.value }))} type="text" required />
              </label>
              <label>
                New password
                <input value={resetData.newPassword} onChange={(event: InputChangeEvent) => setResetData((current: ConfirmForgotPasswordInput) => ({ ...current, newPassword: event.target.value }))} type="password" required />
              </label>
            </>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Continuar'}
          </button>
        </form>

        {message ? (
          <p className="auth-message" role="alert">
            {message}
          </p>
        ) : null}
        {mode !== 'login' ? (
          <p className="auth-message">
            <a className="auth-link-inline" href="/login">Ya tengo cuenta</a>
          </p>
        ) : null}
      </section>
    </main>
  )
}
