import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApiClient } from '@components/api-client'

describe('api-client', () => {
  const client = createApiClient({ baseUrl: 'http://localhost' })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockJsonResponse(body: object, status = 200): void {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  it('login returns access token', async () => {
    mockJsonResponse({
      accessToken: 'mocked-access-token',
      refreshToken: 'mocked-refresh',
      user: { id: 'user-1', email: 'a@b.com', role: 'student' },
    })

    const res = await client.login({ email: 'a@b.com', password: 'p' })
    expect(res.accessToken).toBe('mocked-access-token')
  })

  it('register returns a session', async () => {
    mockJsonResponse({
      accessToken: 'mocked-access-token',
      refreshToken: 'mocked-refresh',
      user: { id: 'user-1', email: 'x@y.com', role: 'student' },
    })

    const res = await client.register({ email: 'x@y.com', password: 'p', role: 'student' })
    expect(res.accessToken).toBe('mocked-access-token')
  })

  it('createAttempt returns attemptId', async () => {
    mockJsonResponse({
      attemptId: 'attempt-mock-1',
      isCorrect: false,
      errorType: 'BORROW_OMITTED_TENS',
      classifierSource: 'RULE_ENGINE',
      confidence: 0.94,
    }, 201)

    const attempt = await client.createAttempt({
      studentId: 's1',
      skillKey: 'subtraction_borrow',
      rawSteps: [{ expression: '53−26=33', isFinal: true }],
      expectedAnswer: 27,
      studentAnswer: 33,
    })

    expect(attempt.attemptId).toBe('attempt-mock-1')
    expect(attempt.errorType).toBe('BORROW_OMITTED_TENS')
  })
})
