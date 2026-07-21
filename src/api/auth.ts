import { API_BASE_URL } from '@/constants/config';

import { clearTokens, loadTokens, saveTokens, type StoredTokens } from './token-storage';

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthUser = {
  id: number;
  email: string;
};

/** Error thrown for any non-2xx backend response, carrying the HTTP status. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Turn FastAPI's `{ detail: ... }` body into a human-readable message. */
function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === 'object' && 'msg' in first) {
      return String((first as { msg: unknown }).msg);
    }
  }
  return fallback;
}

async function parseError(res: Response): Promise<ApiError> {
  let detail: unknown;
  try {
    detail = (await res.json())?.detail;
  } catch {
    detail = undefined;
  }
  return new ApiError(messageFromDetail(detail, `Request failed (${res.status})`), res.status);
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const tokens = await loadTokens();
    if (tokens) finalHeaders.Authorization = `Bearer ${tokens.accessToken}`;
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });

  // On an expired access token, try a one-shot refresh and replay the request.
  if (auth && res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      finalHeaders.Authorization = `Bearer ${refreshed.accessToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });
    }
  }

  if (!res.ok) throw await parseError(res);
  // 204 / empty bodies
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function toStored(pair: TokenPair): StoredTokens {
  return { accessToken: pair.access_token, refreshToken: pair.refresh_token };
}

export async function signup(
  email: string,
  password: string,
  confirmPassword: string,
): Promise<StoredTokens> {
  const pair = await request<TokenPair>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
  });
  const tokens = toStored(pair);
  await saveTokens(tokens);
  return tokens;
}

export async function signin(email: string, password: string): Promise<StoredTokens> {
  const pair = await request<TokenPair>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const tokens = toStored(pair);
  await saveTokens(tokens);
  return tokens;
}

export async function forgotPassword(email: string): Promise<void> {
  await request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/** Exchange the stored refresh token for a fresh pair. Returns null on failure. */
export async function tryRefresh(): Promise<StoredTokens | null> {
  const tokens = await loadTokens();
  if (!tokens) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      return null;
    }
    const next = toStored((await res.json()) as TokenPair);
    await saveTokens(next);
    return next;
  } catch {
    return null;
  }
}

export async function me(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', { method: 'GET', auth: true });
}
