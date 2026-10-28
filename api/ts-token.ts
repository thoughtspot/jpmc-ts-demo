// Vercel function: POST /api/ts-token { username } → plain-text ThoughtSpot auth token.
import {
  fetchThoughtSpotToken,
  parseUsername,
  UsernameRejectedError,
} from '../server/tokenService';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: Request): Promise<Response> {
  let body: { username?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    /* invalid JSON — handled as a missing username below */
  }
  const username = parseUsername(body?.username);
  if (!username) {
    return new Response('A valid username is required', { status: 400, headers: NO_STORE });
  }

  try {
    const token = await fetchThoughtSpotToken(process.env, username);
    return new Response(token, {
      headers: { ...NO_STORE, 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.error('[ts-token]', err instanceof Error ? err.message : err);
    if (err instanceof UsernameRejectedError) {
      return new Response('Username not allowed', { status: 403, headers: NO_STORE });
    }
    return new Response('Unable to obtain ThoughtSpot token', { status: 502, headers: NO_STORE });
  }
}
