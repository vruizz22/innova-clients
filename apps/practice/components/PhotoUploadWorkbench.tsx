'use client'

import { useState, useRef, type FormEvent } from 'react'
import { createApiClient } from '@components/api-client'
import { getAccessToken } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

type PhotoUploadWorkbenchProps = {
  studentId?: string
  apiBaseUrl?: string
}

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

/**
 * PhotoUploadWorkbench — Capture or upload image of math work.
 * Strips EXIF, uploads to S3 (presigned), then polls for OCR result from Gemini.
 */
export function PhotoUploadWorkbench({ studentId, apiBaseUrl }: PhotoUploadWorkbenchProps) {
  void studentId
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<{ finalAnswer: string; steps: string[]; confidence: number } | null>(null)

  const apiClient = createApiClient({
    baseUrl: apiBaseUrl || getPublicRuntimeConfig().apiUrl,
    getAccessToken,
  })

  async function stripExifFromImage(file: File): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl)
          resolve(blob || new Blob())
        }, 'image/jpeg')
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Could not load image'))
      }
      img.src = objectUrl
    })
  }

  async function handlePhotoSelect(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')
    setOcrResult(null)

    try {
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      const cleanImage = await stripExifFromImage(file)
      const result = await apiClient.extractOcr(cleanImage)

      setMessage('Imagen procesada correctamente.')
      setOcrResult({
        finalAnswer: result.finalAnswer,
        steps: result.rawSteps.map((step) => step.expression),
        confidence: result.confidence,
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al procesar la imagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card scan-section">
      <div>
        <h2>Subir foto de tu trabajo</h2>
        <p>Toma una foto o sube una imagen de tu problema escrito a mano. Gemini extraerá los pasos.</p>
        <div className="scan-privacy-badges">
          <span className="privacy-badge"><LockIcon /> Sin datos personales</span>
          <span className="privacy-badge"><CheckCircleIcon /> EXIF eliminado</span>
          <span className="privacy-badge"><ShieldIcon /> Cumple COPPA</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          disabled={loading}
          capture="environment"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
        >
          {loading ? 'Procesando...' : 'Seleccionar foto'}
        </button>
      </div>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Vista previa de tu trabajo"
          style={{ maxWidth: '100%', borderRadius: 'var(--r-lg)' }}
        />
      )}

      {ocrResult && (
        <div className="ocr-result">
          <p style={{ margin: '0 0 var(--sp-1)', fontSize: 'var(--text-body-sm)' }}>
            <strong>Respuesta final:</strong> {ocrResult.finalAnswer}
          </p>
          <p style={{ margin: '0 0 var(--sp-1)', fontSize: 'var(--text-body-sm)' }}>
            <strong>Confianza OCR:</strong> {Math.round(ocrResult.confidence * 100)}%
          </p>
          {ocrResult.steps && (
            <div style={{ fontSize: 'var(--text-body-sm)' }}>
              <strong>Pasos:</strong>
              <ul style={{ margin: 'var(--sp-1) 0 0', paddingLeft: 'var(--sp-4)' }}>
                {ocrResult.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {message && <p className="scan-message">{message}</p>}
    </section>
  )
}
