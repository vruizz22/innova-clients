'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { getAccessToken, getStoredSession } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { createApiClient, type AttemptInput, type AttemptResponse } from '@components/api-client'
import { VisualErrorRenderer } from '@components/VisualErrorRenderer'

export function AttemptWorkbench(): JSX.Element {
  const apiBaseUrl = getPublicRuntimeConfig().apiUrl
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: apiBaseUrl, getAccessToken }),
    [apiBaseUrl],
  )
  const [hasSession, setHasSession] = useState(false)
  const [studentId, setStudentId] = useState('')

  useEffect(() => {
    const session = getStoredSession()
    setHasSession(session !== null)
    setStudentId(session?.user.profileId ?? '')
  }, [])

  const [skillKey, setSkillKey] = useState('subtraction_borrow')
  const [expectedAnswer, setExpectedAnswer] = useState(27)
  const [studentAnswer, setStudentAnswer] = useState(33)
  const [minuend, setMinuend] = useState(53)
  const [subtrahend, setSubtrahend] = useState(26)
  const [result, setResult] = useState<AttemptResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitAttempt(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const payload: AttemptInput = {
      studentId,
      skillKey,
      rawSteps: [{ expression: `${minuend} - ${subtrahend} = ${studentAnswer}`, isFinal: true }],
      expectedAnswer,
      studentAnswer,
      minuend,
      subtrahend,
    }

    try {
      const response = await apiClient.createAttempt(payload)
      setResult(response)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unknown attempt error')
    } finally {
      setLoading(false)
    }
  }

  const normalizedErrorType = result?.errorType === 'BORROW_OMITTED'
    ? 'BORROW_OMITTED_TENS'
    : result?.errorType

  const rendererSlug = (normalizedErrorType ?? 'BORROW_OMITTED_TENS') as
    | 'BORROW_OMITTED_TENS'
    | 'CARRY_OMITTED'
    | 'ZERO_TIMES_X_NONZERO'
    | 'COMMON_DENOMINATOR_MISSED'

  if (!hasSession) {
    return (
      <section className="auth-form" style={{ marginTop: 20 }}>
        <h3>Sesión requerida</h3>
        <p>Inicia sesión para enviar intentos.</p>
        <a className="auth-submit" href="/login">Ir a login</a>
      </section>
    )
  }

  return (
    <>
      <section style={{marginTop:20}}>
        <h3>Enviar intento</h3>
        <form onSubmit={submitAttempt} style={{display:'grid', gap:12}}>
          <label>
            Skill key
            <input value={skillKey} onChange={(event) => setSkillKey(event.target.value)} />
          </label>
          <label>
            Expected answer
            <input type="number" value={expectedAnswer} onChange={(event) => setExpectedAnswer(Number(event.target.value))} />
          </label>
          <label>
            Student answer
            <input type="number" value={studentAnswer} onChange={(event) => setStudentAnswer(Number(event.target.value))} />
          </label>
          <label>
            Minuend
            <input type="number" value={minuend} onChange={(event) => setMinuend(Number(event.target.value))} />
          </label>
          <label>
            Subtrahend
            <input type="number" value={subtrahend} onChange={(event) => setSubtrahend(Number(event.target.value))} />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar intento'}</button>
        </form>
      </section>

      <section style={{marginTop:20}}>
        <h3>Feedback</h3>
        {result ? <VisualErrorRenderer slug={rendererSlug} /> : null}
        {result ? (
          <p className="auth-message">
            {result.isCorrect
              ? 'Respuesta correcta.'
              : `Error detectado: ${result.errorType} (${Math.round(result.confidence * 100)}% confianza).`}
          </p>
        ) : null}
        {error ? <p className="auth-message">{error}</p> : null}
      </section>
    </>
  )
}
