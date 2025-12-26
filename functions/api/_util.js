// functions/api/_util.js

import jwt from "@tsndr/cloudflare-worker-jwt";

/**
 * Helpers
 */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function bad(message, status = 400) {
  return json({ ok: false, error: message }, status);
}

/**
 * ID helper
 */
export function uid() {
  return crypto.randomUUID();
}

/**
 * JWT helpers (COOKIE-BASED AUTH)
 */
export async function signJWT(env, payload) {
  return await jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000)
    },
    env.JWT_SECRET
  );
}

export async function verifyJWT(env, token) {
  try {
    return await jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Cookie helpers
 */
export function setAuthCookie(token) {
  return {
    "Set-Cookie": `auth=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  };
}

export function clearAuthCookie() {
  return {
    "Set-Cookie": `auth=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
  };
}

/**
 * Read logged-in user from cookie
 */
export async function getUserFromRequest(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/auth=([^;]+)/);
  if (!match) return null;

  const token = match[1];
  const valid = await verifyJWT(env, token);
  if (!valid) return null;

  return valid.payload;
}

/**
 * Require login
 */
export async function requireUser(context) {
  const user = await getUserFromRequest(context.request, context.env);
  if (!user) return null;
  return user;
}
