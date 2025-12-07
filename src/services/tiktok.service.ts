import crypto from 'crypto';

export type TikTokTokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: Date;
  shopId: string;
  scopes?: string;
};

const AUTH_BASE = process.env.TIKTOK_AUTH_BASE_URL || 'https://auth.tiktok-shops.com';
const API_BASE = process.env.TIKTOK_API_BASE_URL || 'https://open-api.tiktokglobalshop.com';
const APP_KEY = process.env.TIKTOK_APP_KEY || '';
const APP_SECRET = process.env.TIKTOK_APP_SECRET || '';
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || '';

function assertConfig() {
  if (!APP_KEY || !APP_SECRET || !REDIRECT_URI) {
    throw new Error('TIKTOK_APP_KEY, TIKTOK_APP_SECRET, dan TIKTOK_REDIRECT_URI wajib diisi');
  }
}

export function buildAuthUrl(state: string) {
  assertConfig();
  const params = new URLSearchParams({
    app_key: APP_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    state,
  });
  return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TikTok API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function exchangeToken(code: string): Promise<TikTokTokenResponse> {
  assertConfig();

  type RawResponse = {
    code: number;
    message: string;
    data?: {
      access_token: string;
      refresh_token: string;
      access_token_expires_in: number;
      refresh_token_expires_in?: number;
      shop_id: string;
      scope?: string;
    };
  };

  const payload = {
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    auth_code: code,
    grant_type: 'authorized_code',
  };

  const raw = await postJson<RawResponse>(`${AUTH_BASE}/api/v2/token/get`, payload);

  if (raw.code !== 0 || !raw.data) {
    throw new Error(`Gagal tukar token: ${raw.message}`);
  }

  const expires = new Date(Date.now() + raw.data.access_token_expires_in * 1000);

  return {
    accessToken: raw.data.access_token,
    refreshToken: raw.data.refresh_token,
    accessTokenExpiry: expires,
    shopId: raw.data.shop_id,
    scopes: raw.data.scope,
  };
}

export async function refreshToken(refreshToken: string): Promise<TikTokTokenResponse> {
  assertConfig();

  type RawResponse = {
    code: number;
    message: string;
    data?: {
      access_token: string;
      refresh_token: string;
      access_token_expires_in: number;
      shop_id: string;
      scope?: string;
    };
  };

  const payload = {
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  };

  const raw = await postJson<RawResponse>(`${AUTH_BASE}/api/v2/token/refresh`, payload);

  if (raw.code !== 0 || !raw.data) {
    throw new Error(`Gagal refresh token: ${raw.message}`);
  }

  const expires = new Date(Date.now() + raw.data.access_token_expires_in * 1000);

  return {
    accessToken: raw.data.access_token,
    refreshToken: raw.data.refresh_token,
    accessTokenExpiry: expires,
    shopId: raw.data.shop_id,
    scopes: raw.data.scope,
  };
}

// TikTok OpenAPI membutuhkan signature HMAC-SHA256 atas path + params. Ini helper dasar.
export function signRequest(path: string, params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');
  const message = `${path}${sorted}`;
  return crypto.createHmac('sha256', APP_SECRET).update(message).digest('hex');
}

export async function callTikTokApi<T>(
  path: string,
  accessToken: string,
  params: Record<string, string | number> = {},
  method: 'GET' | 'POST' = 'GET',
  body?: unknown,
): Promise<T> {
  assertConfig();

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const stringParams: Record<string, string> = {
    app_key: APP_KEY,
    access_token: accessToken,
    sign_method: 'sha256',
    timestamp,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  };

  const signature = signRequest(path, stringParams);
  const search = new URLSearchParams({ ...stringParams, sign: signature }).toString();
  const url = `${API_BASE}${path}?${search}`;

  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TikTok API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}
