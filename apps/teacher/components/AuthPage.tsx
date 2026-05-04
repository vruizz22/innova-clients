'use client'

import { useMemo, useState, type FormEvent } from 'react'

import { clearStoredSession, getDashboardUrl, storeSession } from '@shared/auth-session'
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
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000', [])
  const authClient = useMemo(() => createApiClient({ baseUrl }), [baseUrl])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' })
  const [registerData, setRegisterData] = useState<RegisterInput>({ email: '', password: '', role: 'teacher' })
  const [forgotData, setForgotData] = useState<ForgotPasswordInput>({ email: '' })
  const [resetData, setResetData] = useState<ConfirmForgotPasswordInput>({ email: '', code: '', newPassword: '' })

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
          <p className="auth-eyebrow">SuperProfes profesores</p>
          <h1>{title}</h1>
          <p>
            Base URL: <strong>{baseUrl}</strong>
          </p>
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
                  onChange={(event: InputChangeEvent) =>
                    setRegisterData((current: RegisterInput) => ({
                      ...current,
                      role: event.target.value === 'teacher' ? 'teacher' : 'student',
                    }))
                  }
                >
                  <option value="teacher">Profesor</option>
                  <option value="student">Alumno</option>
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

        <p className="auth-message">{message || 'La sesión se valida contra el backend local configurado.'}</p>
        {mode !== 'login' ? (
          <p className="auth-message">
            <a className="auth-link-inline" href="/login">Ya tengo cuenta</a>
          </p>
        ) : null}
        {mode === 'login' ? (
          <p className="auth-message">
            <button
              type="button"
              className="auth-link-inline"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
              onClick={() => {
                clearStoredSession()
                setMessage('Sesión local limpiada.')
              }}
            >
              Limpiar sesión local
            </button>
          </p>
        ) : null}
      </section>
    </main>
  )
}
