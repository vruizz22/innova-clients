'use client'

import { useMemo, useState, type FormEvent } from 'react'

import { createApiClient, type ApiResponse, type AttemptInput } from '@shared/api-client'
import { VisualErrorRenderer } from './VisualErrorRenderer'

export function AttemptWorkbench(): JSX.Element {
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000', [])
  const apiClient = useMemo(() => createApiClient({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [studentId, setStudentId] = useState('student-001')
  const [skillKey, setSkillKey] = useState('subtraction_borrow')
  const [expectedAnswer, setExpectedAnswer] = useState(27)
  const [studentAnswer, setStudentAnswer] = useState(33)
  const [minuend, setMinuend] = useState(53)
  const [subtrahend, setSubtrahend] = useState(26)
  const [result, setResult] = useState<ApiResponse | null>(null)
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
      setResult({ suggestedSlug: 'BORROW_OMITTED_TENS', errorType: 'BORROW_OMITTED_TENS' })
    } finally {
      setLoading(false)
    }
  }

  const rendererSlug = (result?.suggestedSlug ?? result?.errorType ?? 'BORROW_OMITTED_TENS') as
    | 'BORROW_OMITTED_TENS'
    | 'CARRY_OMITTED'
    | 'ZERO_TIMES_X_NONZERO'
    | 'COMMON_DENOMINATOR_MISSED'

  return (
    <>
      <section style={{marginTop:20}}>
        <h3>Attempt submission</h3>
        <form onSubmit={submitAttempt} style={{display:'grid', gap:12}}>
          <label>
            Student UUID
            <input value={studentId} onChange={(event) => setStudentId(event.target.value)} />
          </label>
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
          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit attempt'}</button>
        </form>
      </section>

      <section style={{marginTop:20}}>
        <h3>Visual Error Renderer (example)</h3>
        <VisualErrorRenderer slug={rendererSlug} />
        {error ? <p className="auth-message">{error}</p> : null}
        {result?.message ? <p className="auth-message">{result.message}</p> : null}
      </section>
    </>
  )
}
