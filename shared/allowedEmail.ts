/** Single source of truth for who may sign in; used by the login page and /api/ts-token. */
export const ALLOWED_EMAIL_DOMAINS: readonly string[] = ['jpmchase.com', 'jpmorgan.com', 'chase.com'];

/** True if `username` is an email address on one of the allowed domains. */
export function isAllowedEmail(username: string): boolean {
  const parts = username.trim().toLowerCase().split('@');
  return parts.length === 2 && parts[0].length > 0 && ALLOWED_EMAIL_DOMAINS.includes(parts[1]);
}
