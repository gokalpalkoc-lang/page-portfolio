import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// One admin, one password. A session is a signed cookie holding its expiry time.
// The signing key includes the password, so changing ADMIN_PASSWORD signs
// everyone out.

export const SESSION_COOKIE = "portfolio_admin";
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7;

const MIN_PASSWORD_LENGTH = 12;
const MIN_SECRET_LENGTH = 32;

interface AuthConfig {
  password: string;
  secret: string;
}

/** The admin is disabled until both variables are set to strong values. */
export function authConfig(): AuthConfig | null {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  if (password.length < MIN_PASSWORD_LENGTH || secret.length < MIN_SECRET_LENGTH) return null;
  return { password, secret };
}

export function checkPassword(config: AuthConfig, attempt: string): boolean {
  // Hash both sides first: timingSafeEqual needs equal lengths and must not leak the real one.
  return safeEqual(sha256(attempt), sha256(config.password));
}

export function createSessionToken(config: AuthConfig, now = Date.now()): string {
  const expires = String(now + SESSION_MAX_AGE_S * 1000);
  return `${expires}.${sign(config, expires)}`;
}

export function verifySessionToken(config: AuthConfig | null, token: string | undefined, now = Date.now()): boolean {
  if (!config || !token) return false;
  const [expires, signature, ...rest] = token.split(".");
  if (!expires || !signature || rest.length > 0 || !/^\d+$/.test(expires)) return false;
  if (!safeEqual(Buffer.from(signature), Buffer.from(sign(config, expires)))) return false;
  return Number(expires) > now;
}

function sign(config: AuthConfig, payload: string): string {
  const key = `${config.secret}:${sha256(config.password).toString("hex")}`;
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}
