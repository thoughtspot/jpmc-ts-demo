// ---------------------------------------------------------------------------
// Server-side client for the ts-embed-lab token service. Runs only on the
// server (Vercel function / Vite dev middleware) so TOKEN_SERVICE_API_KEY never
// reaches the browser bundle.
// ---------------------------------------------------------------------------

export interface TokenServiceEnv {
  TOKEN_SERVICE_URL?: string;
  TOKEN_SERVICE_API_KEY?: string;
  TS_INSTANCE?: string;
  TS_ORG?: string;
}

const REQUIRED_VARS = [
  'TOKEN_SERVICE_URL',
  'TOKEN_SERVICE_API_KEY',
  'TS_INSTANCE',
  'TS_ORG',
] as const;

const MAX_USERNAME_LENGTH = 255;
const MAX_ERROR_DETAIL = 300;

// Token-service statuses that mean "this username isn't allowed" rather than a
// service/config problem (401 = bad API key, which is ours to fix, not the user's).
const USERNAME_REJECTED_STATUSES = new Set([400, 403]);

/** The token service refused to issue a token for the requested username. */
export class UsernameRejectedError extends Error {}
const USERNAME_RE = /^[^\s\x00-\x1f\x7f]+$/;

/** Validate the username sent by the login screen; returns null if unusable. */
export function parseUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const username = raw.trim();
  if (!username || username.length > MAX_USERNAME_LENGTH) return null;
  return USERNAME_RE.test(username) ? username : null;
}

/** Request a ThoughtSpot auth token for `username` from the token service. */
export async function fetchThoughtSpotToken(
  env: TokenServiceEnv,
  username: string,
): Promise<string> {
  const missing = REQUIRED_VARS.filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(`Token service not configured; missing ${missing.join(', ')}`);
  }

  const baseUrl = env.TOKEN_SERVICE_URL!.replace(/\/$/, '');
  const url = `${baseUrl}/api/token`;
  const params = new URLSearchParams({
    instance: env.TS_INSTANCE!,
    org: env.TS_ORG!,
    username,
  });
  // API key goes in the Bearer header (not the api_key query param) so it never
  // lands in URL logs.
  const res = await fetch(`${url}?${params}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${env.TOKEN_SERVICE_API_KEY}`,
    },
  });
  // Error details go to the server log only; the route returns a generic 502.
  if (!res.ok) {
    const detail = (await res.text()).slice(0, MAX_ERROR_DETAIL);
    const message = `Token service GET ${url} failed (${res.status}): ${detail}`;
    if (USERNAME_REJECTED_STATUSES.has(res.status)) throw new UsernameRejectedError(message);
    throw new Error(message);
  }
  const data = await res.json();
  if (typeof data?.token !== 'string' || !data.token) {
    const keys = data && typeof data === 'object' ? Object.keys(data).join(', ') : typeof data;
    throw new Error(`Token service response had no "token" field (keys: ${keys})`);
  }
  return data.token;
}
