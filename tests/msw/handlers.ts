import { rest } from 'msw';

export const handlers = [
  rest.post('*/auth/login', async (req, res, ctx) => {
    // simple mock: accept any credentials
    return res(
      ctx.status(200),
      ctx.json({ accessToken: 'mocked-access-token', refreshToken: 'mocked-refresh' })
    );
  }),

  rest.post('*/auth/register', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'user created (mock)' }));
  }),

  rest.post('*/attempts', async (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ attemptId: 'attempt-mock-1', errorType: 'BORROW_OMITTED_TENS' })
    );
  }),
];
