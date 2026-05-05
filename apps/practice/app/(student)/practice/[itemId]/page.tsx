'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MathInput, type StepInput } from '@/components/MathInput'
import { getItem, submitAttempt, type PracticeItem } from '@/lib/api'
import { getStoredSession } from '@shared/auth-session'

interface PageProps {
  params: { itemId: string }
}

function parseSubtraction(prompt: string): { minuend?: number; subtrahend?: number } {
  const match = prompt.match(/(-?\d+)\s*[-−]\s*(-?\d+)/)
  if (!match) return {}
  return {
    minuend: Number(match[1]),
    subtrahend: Number(match[2]),
  }
}

export default function PracticeItemPage({ params }: PageProps): JSX.Element {
  const router = useRouter()
  const [item, setItem] = useState<PracticeItem | null>(null)
  const [loadingItem, setLoadingItem] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadItem(): Promise<void> {
      setLoadingItem(true)
      setError('')
      try {
        const backendItem = await getItem(params.itemId)
        if (!cancelled) setItem(backendItem)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el ejercicio.')
        }
      } finally {
        if (!cancelled) setLoadingItem(false)
      }
    }

    void loadItem()

    return () => {
      cancelled = true
    }
  }, [params.itemId])

  async function handleSubmit(steps: StepInput[], finalAnswer: string): Promise<void> {
    if (!item) return

    const expectedAnswer = item.content.expectedAnswer
    if (typeof expectedAnswer !== 'number') {
      setError('El ejercicio no tiene respuesta esperada configurada.')
      return
    }

    const session = getStoredSession()
    const studentId = session?.user.profileId
    if (!studentId) {
      setError('Tu cuenta no tiene perfil de alumno asociado.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const parsedOperands = parseSubtraction(item.content.prompt ?? item.content.problem)
      const result = await submitAttempt({
        studentId,
        itemId: item.id,
        skillKey: item.skillKey,
        rawSteps: steps.map(({ value, stepIndex }) => ({
          expression: value,
          isFinal: stepIndex === steps.length - 1,
        })),
        expectedAnswer,
        studentAnswer: Number(finalAnswer),
        ...parsedOperands,
      })

      router.push(
        `/practice/${params.itemId}/feedback?correct=${result.isCorrect ? '1' : '0'}&error=${result.errorType ?? ''}&conf=${result.confidence}`,
      )
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar tu respuesta.')
      setSubmitting(false)
    }
  }

  return (
    <main className="page-wrapper">
      <a href="/practice" className="exercise-back-link">
        Volver a ejercicios
      </a>

      {loadingItem ? (
        <div className="practice-empty">
          <p>Cargando ejercicio...</p>
        </div>
      ) : null}

      {!loadingItem && error && !item ? (
        <div className="practice-empty" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {!loadingItem && item ? (
        <>
          <p className="exercise-skill-label">{item.skillLabel}</p>
          <h1 className="exercise-title">Resuelve el problema</h1>

          <div className="problem-display">
            <p className="problem-expr math">{item.content.problem}</p>
          </div>

          <div className="steps-card">
            <p className="steps-card-title">Escribe tu solución paso a paso</p>
            <MathInput
              stepCount={3}
              stepLabels={['Paso 1 (unidades)', 'Paso 2 (decenas)', 'Respuesta final']}
              onSubmit={handleSubmit}
              loading={submitting}
            />
            {error ? (
              <p className="inline-error" role="alert">{error}</p>
            ) : null}
          </div>
        </>
      ) : null}
    </main>
  )
}

