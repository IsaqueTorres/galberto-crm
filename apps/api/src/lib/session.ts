import { createHash, randomBytes } from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getCookie, getSignedCookie, setCookie, setSignedCookie } from "hono/cookie";

const DEFAULT_SESSION_COOKIE_NAME = "galberto_crm_session";
const DEFAULT_SESSION_TTL_DAYS = 7;

function getSessionTtlDays(): number {
  const parsedValue = Number.parseInt(process.env.SESSION_TTL_DAYS ?? "", 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_SESSION_TTL_DAYS;
  }

  return parsedValue;
}

function getCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    sameSite: "Lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export function getSessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME?.trim() || DEFAULT_SESSION_COOKIE_NAME;
}

export function getSessionCookieSecret(): string | null {
  const secret = process.env.COOKIE_SECRET?.trim();

  return secret ? secret : null;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiresAt(now = new Date()): Date {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + getSessionTtlDays());
  return expiresAt;
}

export async function setSessionCookie(
  c: Context,
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieName = getSessionCookieName();
  const cookieSecret = getSessionCookieSecret();
  const options = getCookieOptions(expiresAt);

  if (cookieSecret) {
    await setSignedCookie(c, cookieName, token, cookieSecret, options);
    return;
  }

  setCookie(c, cookieName, token, options);
}

export async function readSessionCookie(c: Context): Promise<string | null> {
  const cookieName = getSessionCookieName();
  const cookieSecret = getSessionCookieSecret();

  if (cookieSecret) {
    const signedValue = await getSignedCookie(c, cookieSecret, cookieName);
    return typeof signedValue === "string" ? signedValue : null;
  }

  const value = getCookie(c, cookieName);
  return value ?? null;
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, getSessionCookieName(), getCookieOptions());
}
