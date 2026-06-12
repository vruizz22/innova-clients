import type { ZodType } from 'zod';

/**
 * Tagged error for every failed request. The client never throws and never
 * silently swallows: callers branch on `result.ok` and inspect `error.kind`.
 */
export type ApiError =
  | { readonly kind: 'network'; readonly message: string; readonly cause?: unknown }
  | {
      readonly kind: 'http';
      readonly status: number;
      readonly message: string;
      readonly body?: unknown;
    }
  | { readonly kind: 'parse'; readonly message: string; readonly issues: unknown };

/** Result<T, ApiError> — no exceptions cross the client boundary. */
export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiError };

export interface ApiClientConfig {
  /** Backend base URL, e.g. NEXT_PUBLIC_API_URL (http://localhost:3000). */
  readonly baseUrl: string;
  /**
   * Returns the Supabase access token to send as `Authorization: Bearer`,
   * or null when anonymous. Injected so this package stays decoupled from
   * any auth provider (Clean Architecture / Dependency Inversion).
   */
  readonly getToken: () => Promise<string | null> | string | null;
  /** Injectable fetch (defaults to global fetch) — eases unit testing. */
  readonly fetchImpl?: typeof fetch;
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions<T> {
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly path: string;
  readonly schema: ZodType<T>;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly json?: unknown;
  readonly form?: FormData;
  readonly signal?: AbortSignal;
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Readonly<Record<string, QueryValue>>
): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(path.replace(/^\//, ''), base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Performs one typed request: injects base URL + Bearer token, serialises the
 * body, validates the response with Zod, and returns a Result.
 */
export async function request<T>(
  config: ApiClientConfig,
  options: RequestOptions<T>
): Promise<ApiResult<T>> {
  const doFetch = config.fetchImpl ?? fetch;
  const url = buildUrl(config.baseUrl, options.path, options.query);

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = await config.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.form) {
    // Let the runtime set the multipart boundary; do not set Content-Type.
    body = options.form;
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  let response: Response;
  try {
    response = await doFetch(url, {
      method: options.method,
      headers,
      ...(body !== undefined ? { body } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (cause) {
    return {
      ok: false,
      error: {
        kind: 'network',
        message: cause instanceof Error ? cause.message : 'Network request failed',
        cause,
      },
    };
  }

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      error: {
        kind: 'http',
        status: response.status,
        message: `HTTP ${response.status} ${response.statusText}`.trim(),
        body: raw,
      },
    };
  }

  const parsed = options.schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        kind: 'parse',
        message: 'Response did not match the expected schema',
        issues: parsed.error.issues,
      },
    };
  }

  return { ok: true, data: parsed.data };
}
