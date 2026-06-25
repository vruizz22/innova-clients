import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { request, type ApiClientConfig } from './http';

const schema = z.object({ id: z.string(), n: z.number() });

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function configWith(fetchImpl: typeof fetch, token: string | null = 'tok'): ApiClientConfig {
  return { baseUrl: 'http://api.test', getToken: () => token, fetchImpl };
}

describe('request', () => {
  it('returns ok with parsed data and injects the Bearer token', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 'a', n: 1 }));
    const result = await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'GET',
      path: '/thing',
      schema,
    });

    expect(result).toEqual({ ok: true, data: { id: 'a', n: 1 } });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/thing');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer tok');
  });

  it('unwraps the backend ResponseInterceptor envelope before validating', async () => {
    // The live NestJS backend wraps payloads: { statusCode, data, timestamp, path, traceId }.
    const envelope = {
      statusCode: 200,
      data: { id: 'a', n: 1 },
      timestamp: '2026-06-16T00:00:00.000Z',
      path: '/thing',
      traceId: 't1',
    };
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(envelope));
    const result = await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'GET',
      path: '/thing',
      schema,
    });
    expect(result).toEqual({ ok: true, data: { id: 'a', n: 1 } });
  });

  it('omits Authorization when no token is available', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 'a', n: 1 }));
    await request(configWith(fetchImpl as unknown as typeof fetch, null), {
      method: 'GET',
      path: '/thing',
      schema,
    });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('serialises query params and skips null/undefined', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 'a', n: 1 }));
    await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'GET',
      path: '/items',
      schema,
      query: { limit: 10, topic: undefined, skillKey: 'SUB' },
    });
    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toBe('http://api.test/items?limit=10&skillKey=SUB');
  });

  it('maps a non-2xx response to a tagged http error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: 'nope' }, { status: 401 }));
    const result = await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'GET',
      path: '/thing',
      schema,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('http');
      if (result.error.kind === 'http') expect(result.error.status).toBe(401);
    }
  });

  it('maps a thrown fetch to a tagged network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    const result = await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'GET',
      path: '/thing',
      schema,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('network');
  });

  it('maps a schema mismatch to a tagged parse error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 'a', n: 'not-a-number' }));
    const result = await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'GET',
      path: '/thing',
      schema,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('parse');
  });

  it('sends a JSON body with Content-Type for POST', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 'a', n: 1 }));
    await request(configWith(fetchImpl as unknown as typeof fetch), {
      method: 'POST',
      path: '/attempts',
      schema,
      json: { studentId: 's1' },
    });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ studentId: 's1' }));
  });
});
