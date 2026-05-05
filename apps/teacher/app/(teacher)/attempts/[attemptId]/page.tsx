'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface AttemptDetail {
  id: string
  itemId: string
  studentId: string
  studentName: string
  skillName: string
  expression: string
  expectedAnswer: string
  studentAnswer: string
  correct: boolean
  errorType?: string
  errorExplanation?: string
  keystrokeLog: Array<{ key: string; timestamp: number }>
  llmEvidence?: {
    confidence: number
    reasoning: string
  }
  bktState?: {
    pKnownBefore: number
    pKnownAfter: number
  }
  createdAt: string
}

export default function AttemptDetailPage(): JSX.Element {
  const router = useRouter()
  const params = useParams()
  const attemptId = params?.attemptId as string
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showKeystroke, setShowKeystroke] = useState(false)

  useEffect(() => {
    async function load(): Promise<void> {
      if (!attemptId) return

      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const response = await authClient.get(`/attempts/${attemptId}`)
        const data = (await response.json()) as AttemptDetail
        setAttempt(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar intento')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [attemptId])

  const handleOverride = async (newCorrect: boolean): Promise<void> => {
    try {
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      await authClient.patch(`/attempts/${attemptId}/override`, { correct: newCorrect })
      if (attempt) {
        setAttempt({ ...attempt, correct: newCorrect })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  return (
    <main style={{ background: 'var(--bg-2)', minHeight: '100vh' }}>
      <style>{`
        .ad-header { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--border); padding: 20px 24px; }
        .ad-header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .ad-back { padding: 0; background: transparent; border: none; color: var(--sky-600); font-weight: 600; cursor: pointer; font-size: 14px; }
        .ad-back:hover { text-decoration: underline; }
        .ad-title { font-size: 24px; font-weight: 700; margin: 0; flex: 1; }
        .ad-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
        .ad-badge.correct { background: #d1fae5; color: #065f46; }
        .ad-badge.incorrect { background: #fee2e2; color: #991b1b; }
        
        .ad-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
        .ad-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        
        /* Card */
        .ad-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
        .ad-card-title { font-size: 16px; font-weight: 700; margin: 0 0 16px; }
        
        /* Problem Display */
        .ad-problem { display: flex; gap: 24px; align-items: flex-start; padding: 20px; background: var(--bg-2); border-radius: 12px; }
        .ad-operation { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ad-operand { font-family: 'ui-monospace, monospace'; font-size: 24px; font-weight: 700; }
        .ad-operator { font-size: 24px; font-weight: 700; color: var(--fg-2); }
        .ad-answer { display: flex; gap: 12px; }
        .ad-answer-column { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ad-answer-value { font-family: 'ui-monospace, monospace'; font-size: 20px; font-weight: 700; padding: 8px 12px; border-radius: 6px; border: 2px solid var(--border); }
        .ad-answer-value.correct { border-color: #16a34a; background: #dcfce7; color: #166534; }
        .ad-answer-value.incorrect { border-color: #dc2626; background: #fee2e2; color: #991b1b; }
        .ad-answer-label { font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--fg-3); }
        
        /* BKT */
        .ad-bkt { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ad-bkt-item { padding: 16px; background: var(--bg-2); border-radius: 8px; }
        .ad-bkt-label { font-size: 12px; text-transform: uppercase; font-weight: 600; color: var(--fg-3); margin-bottom: 8px; }
        .ad-bkt-value { font-size: 28px; font-weight: 700; margin: 0; }
        
        /* LLM Evidence */
        .ad-evidence { padding: 16px; background: var(--sky-50); border: 1px solid var(--sky-200); border-radius: 8px; }
        .ad-evidence-confidence { margin-bottom: 12px; }
        .ad-evidence-confidence-label { font-size: 12px; text-transform: uppercase; font-weight: 600; color: var(--fg-3); margin-bottom: 4px; }
        .ad-evidence-bar { width: 100%; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .ad-evidence-fill { height: 100%; background: var(--sky-600); }
        .ad-evidence-reasoning { font-size: 13px; color: var(--sky-900); margin: 0; }
        
        /* Keystroke */
        .ad-keystroke { padding: 16px; background: var(--bg-2); border-radius: 8px; max-height: 200px; overflow-y: auto; font-family: 'ui-monospace, monospace'; font-size: 12px; }
        .ad-keystroke-entry { margin-bottom: 8px; }
        .ad-keystroke-time { color: var(--fg-3); }
        
        /* Actions */
        .ad-actions { display: flex; gap: 8px; margin-top: 16px; }
        .ad-btn { padding: 8px 16px; border-radius: 6px; border: 1px solid var(--border); background: transparent; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .ad-btn:hover { background: var(--sky-600); color: #fff; border-color: var(--sky-600); }
        .ad-btn.danger { color: #dc2626; border-color: #fecaca; }
        .ad-btn.danger:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
      `}</style>

      {/* Header */}
      <div className="ad-header">
        <div className="ad-header-inner">
          <button className="ad-back" onClick={() => router.back()}>
            ← Volver
          </button>
          <h1 className="ad-title">Detalles del intento</h1>
          {attempt && (
            <span className={`ad-badge ${attempt.correct ? 'correct' : 'incorrect'}`}>
              {attempt.correct ? '✓ Correcto' : '✗ Incorrecto'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="ad-container">
        {loading && <p>Cargando intento...</p>}
        {error && <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && attempt && (
          <div className="ad-grid">
            {/* Left */}
            <div>
              {/* Problem */}
              <div className="ad-card">
                <h3 className="ad-card-title">Problema</h3>
                <div className="ad-problem">
                  <div className="ad-operation">
                    <div className="ad-operand">{attempt.expression.split('-')[0]}</div>
                    <div className="ad-operator">−</div>
                    <div className="ad-operand">{attempt.expression.split('-')[1]}</div>
                    <div style={{ marginTop: '8px', borderTop: '2px solid var(--fg-1)', paddingTop: '8px' }}>
                      <div className="ad-operand">{attempt.expectedAnswer}</div>
                    </div>
                  </div>
                  <div className="ad-answer">
                    <div className="ad-answer-column">
                      <div className={`ad-answer-value ${attempt.correct ? 'correct' : 'incorrect'}`}>
                        {attempt.studentAnswer}
                      </div>
                      <div className="ad-answer-label">Tu respuesta</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keystroke */}
              {attempt.keystrokeLog.length > 0 && (
                <div className="ad-card" style={{ marginTop: '20px' }}>
                  <h3 className="ad-card-title">
                    Registro de teclas{' '}
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--sky-600)',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                      onClick={() => setShowKeystroke(!showKeystroke)}
                    >
                      {showKeystroke ? '▼' : '▶'}
                    </button>
                  </h3>
                  {showKeystroke && (
                    <div className="ad-keystroke">
                      {attempt.keystrokeLog.map((entry, idx) => (
                        <div key={idx} className="ad-keystroke-entry">
                          <span className="ad-keystroke-time">t={entry.timestamp}ms</span> {entry.key}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right */}
            <div>
              {/* BKT State */}
              {attempt.bktState && (
                <div className="ad-card">
                  <h3 className="ad-card-title">Modelo BKT</h3>
                  <div className="ad-bkt">
                    <div className="ad-bkt-item">
                      <div className="ad-bkt-label">P(conocimiento) antes</div>
                      <p className="ad-bkt-value" style={{ color: '#f59e0b' }}>
                        {(attempt.bktState.pKnownBefore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="ad-bkt-item">
                      <div className="ad-bkt-label">P(conocimiento) después</div>
                      <p className="ad-bkt-value" style={{ color: attempt.correct ? '#16a34a' : '#dc2626' }}>
                        {(attempt.bktState.pKnownAfter * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* LLM Evidence */}
              {attempt.llmEvidence && (
                <div className="ad-card" style={{ marginTop: '20px' }}>
                  <h3 className="ad-card-title">Evidencia LLM</h3>
                  <div className="ad-evidence">
                    <div className="ad-evidence-confidence">
                      <div className="ad-evidence-confidence-label">Confianza</div>
                      <div className="ad-evidence-bar">
                        <div
                          className="ad-evidence-fill"
                          style={{ width: `${attempt.llmEvidence.confidence * 100}%` }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>
                        {(attempt.llmEvidence.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <p className="ad-evidence-reasoning">{attempt.llmEvidence.reasoning}</p>
                  </div>
                </div>
              )}

              {/* Error Type */}
              {attempt.errorType && (
                <div className="ad-card" style={{ marginTop: '20px' }}>
                  <h3 className="ad-card-title">Tipo de error</h3>
                  <div style={{ padding: '12px', background: 'var(--bg-2)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: '600' }}>{attempt.errorType}</p>
                    <p style={{ margin: '0', fontSize: '13px', color: 'var(--fg-2)' }}>
                      {attempt.errorExplanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="ad-card" style={{ marginTop: '20px' }}>
                <h3 className="ad-card-title">Acciones</h3>
                <div className="ad-actions">
                  {!attempt.correct && (
                    <button className="ad-btn" onClick={() => void handleOverride(true)}>
                      Marcar como correcto
                    </button>
                  )}
                  {attempt.correct && (
                    <button className="ad-btn danger" onClick={() => void handleOverride(false)}>
                      Marcar como incorrecto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
