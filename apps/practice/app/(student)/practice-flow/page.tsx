'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { createApiClient } from '@shared/api-client'
import { getAccessToken } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { getItems, submitAttempt, type PracticeItem, type AttemptResponse } from '@/lib/api'

type ExerciseStage = 'loading' | 'problem' | 'feedback' | 'complete'

interface ExerciseSession {
  items: PracticeItem[]
  currentIndex: number
  stage: ExerciseStage
  response: string
  feedback: AttemptResponse | null
  error: string
}

const KEYPAD_KEYS = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'del', 0, 'ok'] as const

export default function ExerciseFlowPage(): JSX.Element {
  const router = useRouter()
  const [session, setSession] = useState<ExerciseSession>({
    items: [],
    currentIndex: 0,
    stage: 'loading',
    response: '',
    feedback: null,
    error: '',
  })

  useEffect(() => {
    async function initSession(): Promise<void> {
      try {
        const items = await getItems({ topic: 'subtraction_borrow', limit: 5 })
        if (items.length === 0) {
          setSession((s) => ({ ...s, stage: 'complete', error: 'No hay ejercicios disponibles' }))
          return
        }
        setSession((s) => ({ ...s, items, stage: 'problem', currentIndex: 0, response: '' }))
      } catch (err) {
        setSession((s) => ({
          ...s,
          stage: 'complete',
          error: err instanceof Error ? err.message : 'Error al cargar ejercicios',
        }))
      }
    }

    void initSession()
  }, [])

  const currentItem = session.items[session.currentIndex]

  function handleKeypadPress(key: typeof KEYPAD_KEYS[number]): void {
    if (session.stage !== 'problem') return

    setSession((s) => {
      if (key === 'del') {
        return { ...s, response: s.response.slice(0, -1) }
      }
      if (key === 'ok') {
        return s
      }
      return { ...s, response: s.response + key }
    })
  }

  async function handleSubmit(): Promise<void> {
    if (session.stage !== 'problem' || !currentItem) return

    setSession((s) => ({ ...s, stage: 'feedback' }))

    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })
      const profile = await authClient.me()

      const answer = parseInt(session.response, 10)
      const result = await submitAttempt({
        studentId: profile.user.id,
        skillKey: currentItem.skillKey,
        itemId: currentItem.id,
        rawSteps: [],
        expectedAnswer: currentItem.content.answer,
        studentAnswer: answer,
        minuend: currentItem.content.minuend,
        subtrahend: currentItem.content.subtrahend,
      })

      setSession((s) => ({ ...s, feedback: result }))
    } catch (err) {
      setSession((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Error al enviar respuesta',
      }))
    }
  }

  function handleNextProblem(): void {
    if (!session.feedback) return

    const nextIndex = session.currentIndex + 1
    if (nextIndex >= session.items.length) {
      setSession((s) => ({ ...s, stage: 'complete' }))
      return
    }

    setSession((s) => ({
      ...s,
      currentIndex: nextIndex,
      stage: 'problem',
      response: '',
      feedback: null,
      error: '',
    }))
  }

  if (session.stage === 'loading') {
    return (
      <main className="ex-shell">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando ejercicios...</p>
        </div>
      </main>
    )
  }

  if (session.stage === 'complete') {
    return (
      <main className="ex-shell">
        <div className="ex-complete">
          <h1>¡Completaste la sesión de práctica!</h1>
          <p>{session.items.length} problemas resueltos</p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              border: 'none',
              background: 'var(--sky-500)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Volver al dashboard
          </button>
        </div>
      </main>
    )
  }

  if (!currentItem) {
    return (
      <main className="ex-shell">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Error: No hay ejercicio actual</p>
        </div>
      </main>
    )
  }

  return (
    <main className="ex-shell">
      {/* Progress bar */}
      <div className="ex-progress">
        <div className="ex-prog-label">
          Problema {session.currentIndex + 1} de {session.items.length}
        </div>
        <div className="ex-prog-bar">
          <div
            className="ex-prog-fill"
            style={{ width: `${((session.currentIndex + 1) / session.items.length) * 100}%` }}
          />
        </div>
      </div>

      {session.stage === 'problem' ? (
        <>
          {/* Problem display */}
          <div className="ex-problem">
            <h2 style={{ fontSize: 18, marginBottom: 24, fontWeight: 600 }}>
              {currentItem.skillLabel}
            </h2>

            <div className="pr-problem">
              <div className="pr-operation">
                <div className="pr-number-col">
                  <div className="pr-number">{currentItem.content.minuend}</div>
                </div>
                <div className="pr-operator">−</div>
                <div className="pr-number-col">
                  <div className="pr-number">{currentItem.content.subtrahend}</div>
                </div>
              </div>
              <div className="pr-separator" />
              <div className="pr-answer-input">
                <input
                  type="text"
                  readOnly
                  value={session.response}
                  placeholder="?"
                  className="pr-input-field"
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    textAlign: 'center',
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Keypad */}
          <div className="pr-keypad">
            {KEYPAD_KEYS.map((key, idx) => {
              const isSpecial = typeof key === 'string'
              const label = key === 'del' ? '←' : key === 'ok' ? '✓' : key

              return (
                <button
                  key={idx}
                  className={`pr-key ${isSpecial ? 'pr-key-special' : ''}`}
                  onClick={() => {
                    if (key === 'ok') {
                      void handleSubmit()
                    } else {
                      handleKeypadPress(key)
                    }
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: 8,
                    border: 'none',
                    background: isSpecial ? 'var(--sky-200)' : 'var(--neutral-50)',
                    color: isSpecial ? 'var(--sky-700)' : 'var(--fg-1)',
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {session.stage === 'feedback' && session.feedback ? (
        <>
          {/* Feedback display */}
          <div className="pr-feedback">
            <div
              className={`pr-feedback-header ${session.feedback.isCorrect ? 'correct' : 'incorrect'}`}
              style={{
                padding: '1rem',
                borderRadius: 8,
                marginBottom: 16,
                textAlign: 'center',
                background: session.feedback.isCorrect ? '#d1fae5' : '#fee2e2',
                color: session.feedback.isCorrect ? '#065f46' : '#991b1b',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>
                {session.feedback.isCorrect ? '✓' : '✗'}
              </div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>
                {session.feedback.isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </p>
              <p style={{ fontSize: 14 }}>
                Tu respuesta: <strong>{session.response}</strong>
              </p>
            </div>

            {!session.feedback.isCorrect && session.feedback.errorType ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: '#fef3c7',
                  borderLeft: '4px solid #f59e0b',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 14, color: '#92400e', margin: 0 }}>
                  <strong>Tipo de error:</strong> {session.feedback.errorType}
                </p>
              </div>
            ) : null}

            <button
              onClick={handleNextProblem}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: 'none',
                background: 'var(--sky-500)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {session.currentIndex + 1 >= session.items.length ? 'Terminar' : 'Siguiente problema'}
            </button>
          </div>
        </>
      ) : null}

      {session.error ? (
        <div
          role="alert"
          style={{
            padding: '1rem',
            borderRadius: 8,
            background: '#fee2e2',
            color: '#991b1b',
            marginTop: 16,
          }}
        >
          {session.error}
        </div>
      ) : null}
    </main>
  )
}
