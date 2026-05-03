'use client'

import { useMemo, useState, type FormEvent } from 'react'

import { createApiClient, type ConfirmForgotPasswordInput, type ForgotPasswordInput, type LoginInput, type RegisterInput } from '@shared/api-client'

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
  const [registerData, setRegisterData] = useState<RegisterInput>({ email: '', password: '', role: 'STUDENT' })
  const [forgotData, setForgotData] = useState<ForgotPasswordInput>({ email: '' })
  const [resetData, setResetData] = useState<ConfirmForgotPasswordInput>({ email: '', code: '', newPassword: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'login') {
        const result = await authClient.login(loginData)
        setMessage(result.accessToken ? 'Login success. Token received.' : 'Login completed.')
        return
      }

      if (mode === 'register') {
        const result = await authClient.register(registerData)
        setMessage(result.message ?? 'Registration completed.')
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
          <p className="auth-eyebrow">SuperProfes auth</p>
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
                <input value={loginData.email} onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                Password
                <input value={loginData.password} onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))} type="password" required />
              </label>
            </>
          ) : null}

          {mode === 'register' ? (
            <>
              <label>
                Email
                <input value={registerData.email} onChange={(event) => setRegisterData((current) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                Password
                <input value={registerData.password} onChange={(event) => setRegisterData((current) => ({ ...current, password: event.target.value }))} type="password" required />
              </label>
              <label>
                Role
                <select value={registerData.role} onChange={(event) => setRegisterData((current) => ({ ...current, role: event.target.value === 'TEACHER' ? 'TEACHER' : 'STUDENT' }))}>
                  <option value="STUDENT">STUDENT</option>
                  <option value="TEACHER">TEACHER</option>
                </select>
              </label>
            </>
          ) : null}

          {mode === 'forgot' ? (
            <label>
              Email
              <input value={forgotData.email} onChange={(event) => setForgotData({ email: event.target.value })} type="email" required />
            </label>
          ) : null}

          {mode === 'reset' ? (
            <>
              <label>
                Email
                <input value={resetData.email} onChange={(event) => setResetData((current) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                Recovery code
                <input value={resetData.code} onChange={(event) => setResetData((current) => ({ ...current, code: event.target.value }))} type="text" required />
              </label>
              <label>
                New password
                <input value={resetData.newPassword} onChange={(event) => setResetData((current) => ({ ...current, newPassword: event.target.value }))} type="password" required />
              </label>
            </>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Continuar'}
          </button>
        </form>

        <p className="auth-message">{message || 'Modo demo preparado para backend local y Cognito.'}</p>
      </section>
    </main>
  )
}
