import { json, bad, uid, sha256Hex, signJWT, setAuthCookie } from "../_util.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !email.includes("@")) return bad("Enter a valid email.");
  if (password.length < 8) return bad("Password must be at least 8 characters.");

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
  if (existing) return bad("Account already exists. Try logging in.", 409);

  const salt = uid();
  const hash = await sha256Hex(`${salt}:${password}`);
  const password_hash = `${salt}:${hash}`;

  const id = uid();
  const now = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
  ).bind(id, email, password_hash, now).run();

  const token = await signJWT({ sub: id, email }, env.JWT_SECRET);
  const origin = env.APP_ORIGIN || new URL(request.url).origin;

  return json({ ok: true, user: { id, email } }, { headers: { "Set-Cookie": setAuthCookie(token, origin) } });
}

