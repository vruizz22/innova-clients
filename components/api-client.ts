export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

type BaseConfig = {
  baseUrl: string
  getAccessToken?: () => string | null | undefined
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = LoginInput & {
  role: Exclude<UserRole, 'admin'>
}

export type ForgotPasswordInput = {
  email: string
}

export type ConfirmForgotPasswordInput = {
  email: string
  code: string
  newPassword: string
}

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  cognitoSub?: string | null
  tokenVersion?: number
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type RawStep = {
  expression: string
  isFinal: boolean
}

export type AttemptInput = {
  studentId: string
  skillKey: string
  itemId?: string
  rawSteps: RawStep[]
  expectedAnswer: number
  studentAnswer: number
  minuend?: number
  subtrahend?: number
}

export type AttemptResponse = {
  attemptId: string
  isCorrect: boolean
  errorType: string
  classifierSource: 'RULE_ENGINE' | 'LLM'
  confidence: number
}

export type ApiMessageResponse = {
  message: string
}

export type MasteryState = {
  studentId: string
  skillKey: string
  pKnown: number
}

export type TeacherAlertRecord = {
  id: string
  teacherId: string
  classroomId: string | null
  studentId: string | null
  message: string
  resolved: boolean
  createdAt: string
  updatedAt: string
}

export type PracticeAssignmentResponse = {
  id: string
  studentId: string
  itemIds: string[]
  dueAt?: string
}

export type OcrExtractResponse = {
  rawSteps: RawStep[]
  finalAnswer: string
  topicHint: string | null
  confidence: number
}

export type ApiResponse =
  | AuthSession
  | ApiMessageResponse
  | AttemptResponse
  | MasteryState[]
  | TeacherAlertRecord[]
  | PracticeAssignmentResponse
  | OcrExtractResponse

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: object | FormData
  auth?: boolean
}

function isFormDataBody(body: object | FormData | undefined): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function buildUrl(baseUrl: string, path: string): URL {
  return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
}

function parseError(response: Response, bodyText: string): Error {
  try {
    const parsed = JSON.parse(bodyText) as { message?: unknown; error?: unknown }
    const message = Array.isArray(parsed.message)
      ? parsed.message.join(', ')
      : parsed.message ?? parsed.error
    if (typeof message === 'string' && message.length > 0) {
      return new Error(message)
    }
  } catch {
    // Fall through to generic HTTP error.
  }
  return new Error(bodyText || `Request failed with status ${response.status}`)
}

async function requestJson<TResponse>(
  config: BaseConfig,
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers()
  const isFormData = isFormDataBody(options.body)

  if (!isFormData && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = config.getAccessToken?.()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let requestBody: BodyInit | undefined
  if (isFormDataBody(options.body)) {
    requestBody = options.body
  } else if (options.body !== undefined) {
    requestBody = JSON.stringify(options.body)
  }

  const response = await fetch(buildUrl(config.baseUrl, path), {
    method: options.method ?? 'GET',
    headers,
    body: requestBody,
  })

  const bodyText = await response.text()

  if (!response.ok) {
    throw parseError(response, bodyText)
  }

  if (!bodyText) {
    return undefined as TResponse
  }

  return JSON.parse(bodyText) as TResponse
}

export function createApiClient(config: BaseConfig) {
  return {
    login: (input: LoginInput) =>
      requestJson<AuthSession>(config, '/auth/login', {
        method: 'POST',
        body: input,
        auth: false,
      }),
    register: (input: RegisterInput) =>
      requestJson<AuthSession>(config, '/auth/register', {
        method: 'POST',
        body: input,
        auth: false,
      }),
    refresh: (refreshToken: string) =>
      requestJson<AuthSession>(config, '/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        auth: false,
      }),
    forgotPassword: (input: ForgotPasswordInput) =>
      requestJson<ApiMessageResponse>(config, '/auth/forgot-password', {
        method: 'POST',
        body: input,
        auth: false,
      }),
    confirmForgotPassword: (input: ConfirmForgotPasswordInput) =>
      requestJson<ApiMessageResponse>(config, '/auth/confirm-forgot-password', {
        method: 'POST',
        body: input,
        auth: false,
      }),
    me: () =>
      requestJson<{ user: AuthUser }>(config, '/auth/me'),
    logout: () =>
      requestJson<ApiMessageResponse>(config, '/auth/logout', {
        method: 'POST',
      }),
    createAttempt: (input: AttemptInput) =>
      requestJson<AttemptResponse>(config, '/attempts', {
        method: 'POST',
        body: input,
      }),
    extractOcr: (image: File | Blob) => {
      const form = new FormData()
      form.append('image', image)
      return requestJson<OcrExtractResponse>(config, '/attempts/ocr-extract', {
        method: 'POST',
        body: form,
      })
    },
    getMastery: (studentId: string) =>
      requestJson<MasteryState[]>(config, `/mastery/${encodeURIComponent(studentId)}`),
    listAlerts: (classroomId: string) =>
      requestJson<TeacherAlertRecord[]>(
        config,
        `/alerts?classroomId=${encodeURIComponent(classroomId)}`,
      ),
    resolveAlert: (id: string) =>
      requestJson<TeacherAlertRecord | null>(
        config,
        `/alerts/${encodeURIComponent(id)}/resolve`,
        { method: 'PATCH' },
      ),
    createAssignment: (input: { studentId: string; itemIds: string[]; dueAt?: string }) =>
      requestJson<PracticeAssignmentResponse>(config, '/practice/assign', {
        method: 'POST',
        body: input,
      }),
  }
}
