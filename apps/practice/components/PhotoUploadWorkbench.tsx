'use client'

import { useState, useRef, type FormEvent } from 'react'
import { createApiClient } from '../../../components/api-client'

type PhotoUploadWorkbenchProps = {
  studentId: string
  apiBaseUrl?: string
}

/**
 * PhotoUploadWorkbench — Capture or upload image of math work.
 * Strips EXIF, uploads to S3 (presigned), then polls for OCR result from Gemini.
 */
export function PhotoUploadWorkbench({ studentId, apiBaseUrl = 'http://localhost:3000' }: PhotoUploadWorkbenchProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<{ attemptId?: string; extractedText?: string; steps?: string[] } | null>(
    null,
  )

  const apiClient = createApiClient({ baseUrl: apiBaseUrl })

  async function stripExifFromImage(file: File): Promise<Blob> {
    // Simple EXIF strip: read as Blob and re-encode to lose metadata
    // In production, use piexifjs or similar
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
      // Preview
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Strip EXIF
      const cleanBlob = await stripExifFromImage(file)

      // In a real app, you'd:
      // 1. GET presigned URL from backend
      // 2. PUT image to S3
      // 3. Create attempt with imageId
      // 4. Poll for OCR result

      // For now, simulate:
      setMessage('Mock: Image captured (EXIF stripped). In production, upload to S3 + poll for Gemini OCR.')
      setOcrResult({
        attemptId: `attempt-ocr-mock-${Date.now()}`,
        extractedText: 'Mock OCR: 53 − 26 = 27',
        steps: ['53', '− 26', '= 27'],
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card" style={{ display: 'grid', gap: 16 }}>
      <div>
        <h2>Upload Math Work Photo</h2>
        <p>Take a photo or upload an image of your handwritten math problem. Gemini will extract the steps.</p>
      </div>

      <div className="auth-form">
        <label>
          Photo (JPEG/PNG)
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            disabled={loading}
            capture="environment"
          />
        </label>
        <button type="button" disabled={loading} onClick={() => fileInputRef.current?.click()}>
          {loading ? 'Processing...' : 'Select Photo'}
        </button>
      </div>

      {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />}

      {ocrResult && (
        <div className="card" style={{ background: '#f0f9ff', padding: 12, borderRadius: 8 }}>
          <p>
            <strong>Attempt ID:</strong> {ocrResult.attemptId}
          </p>
          <p>
            <strong>Extracted:</strong> {ocrResult.extractedText}
          </p>
          {ocrResult.steps && (
            <div>
              <strong>Steps:</strong>
              <ul>{ocrResult.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {message && <p className="auth-message">{message}</p>}
    </section>
  )
}
