import { getApiBaseUrl } from '@/lib/config';
import type { ApiEnvelope, TokenPair } from '@/lib/types';
import { clearTokens, loadTokens, saveTokens } from '@/lib/storage';

export class ApiError extends Error {
  status: number;
  body: ApiEnvelope<unknown> | null;

  constructor(message: string, status: number, body: ApiEnvelope<unknown> | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  formData?: FormData;
  vaultPin?: string | null;
  skipRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;
let onAuthCleared: (() => void) | null = null;

export function setOnAuthCleared(handler: (() => void) | null) {
  onAuthCleared = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = await loadTokens();
      if (!refreshToken) return null;

      const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const json = (await res.json().catch(() => null)) as ApiEnvelope<TokenPair> | null;
      if (!res.ok || !json?.success || !json.data) {
        await clearTokens();
        onAuthCleared?.();
        return null;
      }

      await saveTokens(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    headers = {},
    formData,
    vaultPin,
    skipRefresh = false,
  } = options;

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (!formData) {
    reqHeaders['Content-Type'] = reqHeaders['Content-Type'] ?? 'application/json';
  }

  if (auth) {
    const { accessToken } = await loadTokens();
    if (accessToken) reqHeaders.Authorization = `Bearer ${accessToken}`;
  }

  if (vaultPin) {
    reqHeaders['x-vault-pin'] = vaultPin;
  }

  const init: RequestInit = {
    method,
    headers: reqHeaders,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  };

  let res = await fetch(url, init);
  let json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (res.status === 401 && auth && !skipRefresh) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      reqHeaders.Authorization = `Bearer ${nextToken}`;
      res = await fetch(url, { ...init, headers: reqHeaders });
      json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
    }
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status, json);
  }

  return (json?.data ?? null) as T;
}

export async function apiDownload(
  path: string,
  options: { vaultPin?: string | null } = {},
): Promise<{ blob: Blob; contentType: string | null; filename: string | null }> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {};
  const { accessToken } = await loadTokens();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (options.vaultPin) headers['x-vault-pin'] = options.vaultPin;

  let res = await fetch(url, { headers });
  if (res.status === 401) {
    const next = await refreshAccessToken();
    if (next) {
      headers.Authorization = `Bearer ${next}`;
      res = await fetch(url, { headers });
    }
  }

  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as ApiEnvelope<unknown> | null;
    throw new ApiError(json?.message ?? `Download failed (${res.status})`, res.status, json);
  }

  const disposition = res.headers.get('content-disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return {
    blob: await res.blob(),
    contentType: res.headers.get('content-type'),
    filename: match?.[1] ?? null,
  };
}
