// functions/api/_util.js
const enc = new TextEncoder();

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function bad(message, status = 400) {
  return json({ ok: false, error: message }, { status });
}

export function uid() {
  return crypto.randomUUID();
}

export function requireEnv(env, key) {
  const v = env[key];
  if (!v || typeof v !== "string") throw new Error(`Missing env var: ${key}`);
  return v;
}

/** -------- Password hashing (WebCrypto PBKDF2) -------- **/

function b64u(bytes) {
  // base64url
  let str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function unb64u(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  s += "=".repeat(pad);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    key,
    256
  );
  const hash = new Uint8Array(bits);
  // store: pbkdf2$iterations$salt$hash
  return `pbkdf2$120000$${b64u(salt)}$${b64u(hash)}`;
}

export async function verifyPassword(password, stored) {
  try {
    const parts = String(stored || "").split("$");
    if (parts.length !== 4) return false;
    const [alg, iterStr, saltB64, hashB64] = parts;
    if (alg !== "pbkdf2") return false;
    const iterations = parseInt(iterStr, 10);
    if (!iterations || iterations < 50000) return false;

    const salt = unb64u(saltB64);
    const expected = unb64u(hashB64);

    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      256
    );
    const actual = new Uint8Array(bits);

    // constant-time compare
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

/** -------- Minimal JWT (HS256) using WebCrypto -------- **/

function utf8ToBytes(s) {
  return enc.encode(s);
}

async function hmacSha256(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, utf8ToBytes(data));
  return new Uint8Array(sig);
}

export async function signJWT(env, payload, ttlSeconds = 60 * 60 * 24 * 14) {
  const secret = requireEnv(env, "JWT_SECRET");
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const h = b64u(utf8ToBytes(JSON.stringify(header)));
  const p = b64u(utf8ToBytes(JSON.stringify(fullPayload)));
  const data = `${h}.${p}`;

  const sig = await hmacSha256(secret, data);
  const s = b64u(sig);
  return `${data}.${s}`;
}

export async function verifyJWT(env, token) {
  const secret = requireEnv(env, "JWT_SECRET");
  const t = String(token || "");
  const parts = t.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;

  const key = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const ok = await crypto.subtle.verify("HMAC", key, unb64u(s), utf8ToBytes(data));
  if (!ok) return null;

  const payloadJson = new TextDecoder().decode(unb64u(p));
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;

  return payload;
}

/** -------- Cookie helpers -------- **/

export function setAuthCookie(env, token) {
  const origin = (env.APP_ORIGIN || "").trim();
  const secure = origin.startsWith("https://");
  // SameSite=Lax works well for typical same-site navigation on Pages
  const cookie =
    `auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}` +
    (secure ? "; Secure" : "");
  return { "Set-Cookie": cookie };
}

export function clearAuthCookie(env) {
  const origin = (env.APP_ORIGIN || "").trim();
  const secure = origin.startsWith("https://");
  const cookie =
    `auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` +
    (secure ? "; Secure" : "");
  return { "Set-Cookie": cookie };
}

export async function requireUser({ request, env }) {
  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  if (!m) return null;
  const token = decodeURIComponent(m[1]);
  const payload = await verifyJWT(env, token);
  return payload || null;
}
