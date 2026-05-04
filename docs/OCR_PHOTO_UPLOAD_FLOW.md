# OCR + Photo Upload Flow — innova-clients

## Visión general

El alumno puede subir una foto de sus ejercicios matemáticos resueltos. El sistema:
1. **Frontend**: Captura/carga imagen → valida EXIF strip
2. **Frontend**: Envía imagen a S3 vía presigned URL
3. **Frontend**: Crea `Attempt` con `imageId`
4. **Backend**: Gemini Vision procesa imagen → extrae pasos → clasifica error
5. **Frontend**: Poll `/attempts/:id` hasta obtener resultado

## Componentes frontend

### `PhotoUploadWorkbench.tsx`

- **Props**: `studentId`, `apiBaseUrl` (optional, defaults to localhost)
- **Input**: File upload o captura de cámara
- **EXIF stripping**: Canvas redraw (simple) o librería piexifjs (production)
- **S3 upload**: Mock en MVP; presigned URL ready
- **Polling**: Mock en MVP; backend ready

```tsx
import { PhotoUploadWorkbench } from './components/PhotoUploadWorkbench'

export default function ScanPage() {
  return <PhotoUploadWorkbench studentId="student-123" />
}
```

## Backend Pipeline (innova-backend-serverless)

### 1. S3 Event Trigger

```
Student uploads image to presigned URL
  ↓
S3 event → Lambda `ocr-worker` (or EventBridge rule)
  ↓
Gemini Vision OCR extracts steps
  ↓
Result saved in MongoDB `ocr_jobs` collection
  ↓
AttemptService polls and classifies
```

### 2. Gemini Vision Adapter

Ubicado en `innova-backend-serverless/src/adapters/math-ocr/gemini-vision.adapter.ts`:

```typescript
extract(imageBytes: Buffer): Promise<MathOCRResult> {
  // 1. Send to Gemini
  // 2. Parse JSON response
  // 3. Return { extractedText, rawSteps, confidence, topicHint, finalAnswer }
}
```

### 3. Attempt Creation with Image

```typescript
// POST /attempts with imageId
{
  studentId: "s1",
  skillKey: "subtraction_borrow",
  imageId: "s3://bucket/ocr/img-123.jpg",  // NEW
  rawSteps: [],  // Can be empty if OCR-extracted
  expectedAnswer: 27,
  studentAnswer: 33
}
```

### 4. OCR Job Status Polling

```typescript
// GET /attempts/:id/status
// Returns: { status: "PENDING" | "COMPLETED", errorType?: string, steps?: [] }
```

## MVP State

- ✅ Frontend: `PhotoUploadWorkbench` with mock Gemini response
- ✅ Backend: Gemini Vision adapter (GeminiVisionAdapter)
- ✅ Backend: S3 event listener skeleton (OCR worker stub)
- ⏳ Production: Full presigned URL flow + real S3 upload
- ⏳ Production: Real Gemini processing pipeline

## Next Steps

1. **Implement presigned URL endpoint** in backend:
   ```typescript
   POST /attempts/presigned-url
   Response: { url, fields } // for client PUT
   ```

2. **Implement S3 event trigger** in Serverless.yml:
   ```yaml
   functions:
     ocrWorker:
       handler: src/infrastructure/workers/ocr-worker.handler
       events:
         - s3:
             bucket: innova-ocr-uploads
             event: s3:ObjectCreated:*
   ```

3. **Test full flow** with Gemini API key in CI/staging

## Local Testing

```bash
# Mock image upload (no S3 needed)
curl -X POST http://localhost:3000/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "s1",
    "skillKey": "subtraction_borrow",
    "rawSteps": [{"expression": "53−26=33", "isFinal": true}],
    "expectedAnswer": 27,
    "studentAnswer": 33
  }'

# Response (mock): { attemptId: "...", errorType: "BORROW_OMITTED_TENS" }
```

## Production Checklist

- [ ] Cognito auth integrated (get `Authorization: Bearer <token>`)
- [ ] Presigned URL endpoint working
- [ ] S3 bucket configured with CORS + lifecycle (30-day archival)
- [ ] Gemini API key in AWS Secrets Manager
- [ ] OCR Lambda deployed and listening to S3 events
- [ ] Polling endpoint stable (max 10 retries, 5s intervals)
- [ ] EXIF stripping production-ready (piexifjs or server-side)
- [ ] Photo upload UI in `apps/practice` released
