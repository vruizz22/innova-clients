import { describe, it, expect } from 'vitest'
import { createApiClient } from '@shared/api-client'

describe('api-client', () => {
  const client = createApiClient({ baseUrl: 'http://localhost' })

  it('login returns access token', async () => {
    const res = await client.login({ email: 'a@b.com', password: 'p' })
    expect(res.accessToken).toBe('mocked-access-token')
  })

  it('register returns message', async () => {
    const res = await client.register({ email: 'x@y.com', password: 'p', role: 'STUDENT' })
    expect(res.message).toMatch(/user created/) 
  })

  it('createAttempt returns attemptId', async () => {
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
