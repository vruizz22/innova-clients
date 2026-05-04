import { rest } from 'msw';

export const handlers = [
  rest.post('*/auth/login', async (req, res, ctx) => {
    // simple mock: accept any credentials
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'mocked-access-token',
        refreshToken: 'mocked-refresh',
        user: { id: 'user-1', email: 'a@b.com', role: 'student' },
      })
    );
  }),

  rest.post('*/auth/register', async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'mocked-access-token',
        refreshToken: 'mocked-refresh',
        user: { id: 'user-1', email: 'x@y.com', role: 'student' },
      }),
    );
  }),

  rest.post('*/attempts', async (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        attemptId: 'attempt-mock-1',
        isCorrect: false,
        errorType: 'BORROW_OMITTED_TENS',
        classifierSource: 'RULE_ENGINE',
        confidence: 0.94,
      })
    );
  }),
];
