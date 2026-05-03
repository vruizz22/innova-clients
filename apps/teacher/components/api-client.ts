export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = LoginInput & {
  role: 'STUDENT' | 'TEACHER'
}

export type ForgotPasswordInput = {
  email: string
}

export type ConfirmForgotPasswordInput = {
  email: string
  code: string
  newPassword: string
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

export type ApiResponse = {
  accessToken?: string
  refreshToken?: string
  message?: string
  attemptId?: string
  errorType?: string
  suggestedSlug?: string
}

type BaseConfig = {
  baseUrl: string
}

async function postJson<TBody extends object>(baseUrl: string, path: string, body: TBody): Promise<ApiResponse> {
  const response = await fetch(new URL(path, baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as ApiResponse
}

export function createApiClient(config: BaseConfig) {
  return {
    login: (input: LoginInput) => postJson(config.baseUrl, '/auth/login', input),
    register: (input: RegisterInput) => postJson(config.baseUrl, '/auth/register', input),
    forgotPassword: (input: ForgotPasswordInput) => postJson(config.baseUrl, '/auth/forgot-password', input),
    confirmForgotPassword: (input: ConfirmForgotPasswordInput) => postJson(config.baseUrl, '/auth/confirm-forgot-password', input),
    createAttempt: (input: AttemptInput) => postJson(config.baseUrl, '/attempts', input),
  }
}
