export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

export function bad(message, status = 400) {
  return json({ ok: false, error: message }, { status });
}

export function uid() {
  return crypto.randomUUID();
}

export async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Minimal JWT HS256 (no deps)
function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlJSON(obj) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}
async function hmacSHA256(keyStr, msgStr) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msgStr));
  return new Uint8Array(sig);
}

export async function signJWT(payload, secret, expSeconds = 60 * 60 * 24 * 14) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + expSeconds };

  const h = b64urlJSON(header);
  const p = b64urlJSON(full);
  const msg = `${h}.${p}`;
  const sig = await hmacSHA256(secret, msg);
  const s = b64url(sig);
  return `${msg}.${s}`;
}

export async function verifyJWT(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const msg = `${h}.${p}`;
  const expected = await hmacSHA256(secret, msg);
  const expectedS = b64url(expected);
  if (expectedS !== s) return null;

  const payload = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;
  return payload;
}

export function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthCookie(token, origin) {
  const secure = origin?.startsWith("https://") ? "Secure; " : "";
  return `auth=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=${60 * 60 * 24 * 14}`;
}

export function clearAuthCookie(origin) {
  const secure = origin?.startsWith("https://") ? "Secure; " : "";
  return `auth=; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=0`;
}

export async function requireUser(context) {
  const token = getCookie(context.request, "auth");
  if (!token) return null;
  return await verifyJWT(token, context.env.JWT_SECRET);
}

