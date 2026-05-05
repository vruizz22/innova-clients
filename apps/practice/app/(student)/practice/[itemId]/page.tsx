'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getItem, submitAttempt, type PracticeItem } from '@/lib/api'
import { getStoredSession } from '@shared/auth-session'

const KEYPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'del', '0', 'done'] as const
type KeypadKey = typeof KEYPAD_KEYS[number]

function parseSubtraction(prompt: string): { minuend?: number; subtrahend?: number } {
  const match = prompt.match(/(-?\d+)\s*[-−]\s*(-?\d+)/)
  if (!match) return {}
  return {
    minuend: Number(match[1]),
    subtrahend: Number(match[2]),
  }
}

export default function PracticeItemPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ itemId: string }>()
  const itemId = params.itemId

  const [item, setItem] = useState<PracticeItem | null>(null)
  const [loadingItem, setLoadingItem] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [ans, setAns] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadItem(): Promise<void> {
      setLoadingItem(true)
      setError('')
      try {
        const backendItem = await getItem(itemId)
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
  }, [itemId])

  function handleKey(key: KeypadKey): void {
    if (key === 'del') {
      setAns((a) => a.slice(0, -1))
      return
    }
    if (key === 'done') {
      void handleSubmit()
      return
    }
    if (ans.length >= 5) return
    setAns((a) => a + key)
  }

  async function handleSubmit(): Promise<void> {
    if (!item || submitting || ans === '') return

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
        rawSteps: [{ expression: ans, isFinal: true }],
        expectedAnswer,
        studentAnswer: Number(ans),
        ...parsedOperands,
      })

      const correct = result.isCorrect ? '1' : '0'
      const conf = result.confidence
      if (result.isCorrect) {
        router.push(`/practice/${itemId}/feedback?correct=1&conf=${conf}`)
      } else {
        router.push(`/practice/${itemId}/feedback?correct=0&error=${result.errorType ?? ''}&conf=${conf}`)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar tu respuesta.')
      setSubmitting(false)
    }
  }

  const parsedNumbers = item ? parseSubtraction(item.content.prompt ?? item.content.problem) : {}
  const minuend = parsedNumbers.minuend
  const subtrahend = parsedNumbers.subtrahend

  return (
    <>
      <style>{`
        .pr-problem { background:#fff; border:1px solid var(--border); border-radius:20px; padding:32px; display:flex; flex-direction:column; align-items:center; gap:20px; }
        .pr-problem-display { font-family:ui-monospace,monospace; font-size:48px; font-weight:700; text-align:right; line-height:1.3; }
        .pr-problem-input { font-family:ui-monospace,monospace; font-size:40px; font-weight:700; color:var(--sky-700,#1E6FA5); min-width:100px; text-align:center; padding:8px 20px; background:var(--sky-50,#EFF9FF); border:2px solid var(--sky-300,#7DD3F8); border-radius:12px; }
        .pr-keypad { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; width:100%; max-width:320px; }
        .pr-key { height:56px; border-radius:12px; border:1.5px solid var(--border,#D9E3EA); background:#fff; font-family:ui-monospace,monospace; font-size:22px; font-weight:700; cursor:pointer; transition:background .1s,transform .1s; display:grid; place-items:center; }
        .pr-key:hover { background:var(--sky-50,#EFF9FF); }
        .pr-key:active { transform:scale(.95); }
        .pr-key.del { font-size:14px; background:var(--slate-50,#F8FAFC); }
        .pr-key.done { background:var(--sky-600,#2887B0); color:#fff; border-color:var(--sky-600,#2887B0); font-size:14px; }
        .pr-progress { width:100%; height:6px; background:var(--slate-100,#F1F5F9); border-radius:9999px; overflow:hidden; }
        .pr-progress-fill { height:100%; background:var(--sky-500,#3FA7D6); border-radius:9999px; }
        .ex-shell { max-width:400px; margin:0 auto; padding:28px 20px 60px; display:flex; flex-direction:column; gap:24px; }
        .ex-back { font-size:14px; font-weight:600; color:var(--sky-600,#2887B0); text-decoration:none; display:inline-flex; align-items:center; gap:4px; }
        .ex-back:hover { text-decoration:underline; }
        .ex-prog-label { display:flex; justify-content:space-between; font-size:12px; color:var(--fg-2,#667080); font-weight:600; margin-bottom:6px; }
      `}</style>

      <div className="ex-shell" style={{ background: 'var(--bg-student,#EEF7FC)', minHeight: '100vh' }}>
        <a href="/dashboard" className="ex-back">← Volver</a>

        {/* Progress */}
        <div>
          <div className="ex-prog-label">
            <span>Problema 1 de 5</span>
            <span>20%</span>
          </div>
          <div className="pr-progress">
            <div className="pr-progress-fill" style={{ width: '20%' }} />
          </div>
        </div>

        {loadingItem && (
          <div style={{ textAlign: 'center', color: 'var(--fg-2)' }}>Cargando ejercicio...</div>
        )}

        {!loadingItem && error && !item && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, color: '#7A2E2E' }} role="alert">
            {error}
          </div>
        )}

        {!loadingItem && item && (
          <>
            {/* Problem display */}
            <div className="pr-problem">
              <div className="pr-problem-display">
                <div style={{ textAlign: 'right' }}>{minuend ?? item.content.problem}</div>
                {subtrahend !== undefined && (
                  <div style={{ textAlign: 'right' }}>− {subtrahend}</div>
                )}
                <div style={{ borderTop: '3px solid currentColor', marginTop: 4, paddingTop: 4, textAlign: 'right', fontSize: 14, opacity: 0.4 }}>─────</div>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span className="pr-problem-input">{ans !== '' ? ans : '?'}</span>
                </div>
              </div>
            </div>

            {/* Keypad */}
            <div className="pr-keypad">
              {KEYPAD_KEYS.map((key) => (
                <button
                  key={key}
                  className={`pr-key${key === 'del' ? ' del' : key === 'done' ? ' done' : ''}`}
                  onClick={() => handleKey(key)}
                  disabled={submitting}
                  type="button"
                >
                  {key === 'del' ? '⌫ Borrar' : key === 'done' ? (submitting ? '...' : 'Listo') : key}
                </button>
              ))}
            </div>

            {error && (
              <p style={{ color: '#7A2E2E', background: '#fef2f2', borderRadius: 10, padding: '10px 14px', fontSize: 14 }} role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}
