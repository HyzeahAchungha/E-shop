// The only way the app talks to the backend. It never reaches Neon: it calls the Flower API,
// which checks the Clerk session token and validates every request on the server.
export type ApiErrorCode = 'not_configured' | 'unauthorized' | 'network' | 'timeout' | 'validation' | 'server' | 'bad_response';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  /** Per-field messages from a 422 response, keyed by field name. */
  readonly fields: Record<string, string>;

  constructor(code: ApiErrorCode, message: string, status = 0, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

/** Returns a clean base URL, or null when it is missing or unsafe. Plain http is for local development only. */
export function normalizeBaseUrl(raw: string | undefined, allowInsecure: boolean): string | null {
  const value = raw?.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.username || url.password || url.search || url.hash) return null;
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && allowInsecure)) return null;
  return value.replace(/\/+$/, '');
}

type Options = {
  baseUrl: string | null;
  /** Returns the current Clerk session token, or null when signed out. */
  getToken: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export type ApiClient = {
  request<T>(path: string, init?: { method?: 'GET' | 'PUT'; body?: unknown }): Promise<T>;
};

export function createApiClient({ baseUrl, getToken, fetchImpl = fetch, timeoutMs = 15_000 }: Options): ApiClient {
  return {
    async request<T>(path: string, init: { method?: 'GET' | 'PUT'; body?: unknown } = {}): Promise<T> {
      if (!baseUrl) throw new ApiError('not_configured', 'The profile service address is not set.');
      const token = await getToken();
      if (!token) throw new ApiError('unauthorized', 'You are not signed in.', 401);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}${path}`, {
          method: init.method ?? 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          },
          body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
          signal: controller.signal,
        });
      } catch {
        throw controller.signal.aborted
          ? new ApiError('timeout', 'The server took too long to respond.')
          : new ApiError('network', 'Could not reach the server.');
      } finally {
        clearTimeout(timer);
      }

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      if (response.ok) {
        if (payload === null || typeof payload !== 'object') throw new ApiError('bad_response', 'The server sent an unexpected response.', response.status);
        return payload as T;
      }
      const body = (payload && typeof payload === 'object' ? payload : {}) as { fields?: unknown };
      if (response.status === 401) throw new ApiError('unauthorized', 'Your session has expired.', 401);
      if (response.status === 422) {
        const fields: Record<string, string> = {};
        if (body.fields && typeof body.fields === 'object') {
          for (const [key, value] of Object.entries(body.fields)) if (typeof value === 'string') fields[key] = value;
        }
        throw new ApiError('validation', 'Please check the highlighted fields.', 422, fields);
      }
      throw new ApiError('server', 'The server could not complete the request.', response.status);
    },
  };
}

// Set EXPO_PUBLIC_API_URL in .env.local. It is public by design: only the address, never a secret.
// __DEV__ is defined by React Native; the typeof guard keeps this file loadable in plain Node tests.
export const apiBaseUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL, typeof __DEV__ !== 'undefined' && __DEV__ === true);
