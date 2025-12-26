import { json, bad, sha256Hex, signJWT, setAuthCookie } from "../_util.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return bad("Email and password are required.");

  const user = await env.DB.prepare("SELECT id, email, password_hash FROM users WHERE email=?")
    .bind(email)
    .first();
  if (!user) return bad("Invalid email or password.", 401);

  const [salt, storedHash] = String(user.password_hash).split(":");
  const testHash = await sha256Hex(`${salt}:${password}`);
  if (testHash !== storedHash) return bad("Invalid email or password.", 401);

  const token = await signJWT({ sub: user.id, email: user.email }, env.JWT_SECRET);
  const origin = env.APP_ORIGIN || new URL(request.url).origin;

  return json({ ok: true, user: { id: user.id, email: user.email } }, { headers: { "Set-Cookie": setAuthCookie(token, origin) } });
}

