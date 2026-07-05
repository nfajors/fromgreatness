import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./cookies";
import { signSessionToken, verifySessionToken } from "../kimi/session";
import { findUserByUnionId } from "../queries/users";
import { env } from "./env";
import type { User } from "@db/schema";

/**
 * Build a Set-Cookie header value that establishes a signed session for the
 * given user identity (unionId). Works for password, OAuth, or any provider.
 */
export async function buildSessionCookie(
  unionId: string,
  reqHeaders: Headers,
): Promise<string> {
  const token = await signSessionToken({ unionId, clientId: env.appId });
  const opts = getSessionCookieOptions(reqHeaders);
  return cookie.serialize(Session.cookieName, token, {
    httpOnly: opts.httpOnly,
    path: opts.path,
    sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
    secure: opts.secure,
    maxAge: Math.floor(Session.maxAgeMs / 1000),
  });
}

export function buildLogoutCookie(reqHeaders: Headers): string {
  const opts = getSessionCookieOptions(reqHeaders);
  return cookie.serialize(Session.cookieName, "", {
    httpOnly: opts.httpOnly,
    path: opts.path,
    sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
    secure: opts.secure,
    maxAge: 0,
  });
}

/**
 * Resolve the authenticated user from request cookies. Provider-agnostic:
 * reads the signed session JWT and loads the user by unionId.
 */
export async function getUserFromRequest(
  reqHeaders: Headers,
): Promise<User | undefined> {
  const cookieHeader = reqHeaders.get("cookie");
  if (!cookieHeader) return undefined;
  const parsed = cookie.parse(cookieHeader);
  const token = parsed[Session.cookieName];
  if (!token) return undefined;
  const payload = await verifySessionToken(token);
  if (!payload?.unionId) return undefined;
  return findUserByUnionId(payload.unionId);
}
