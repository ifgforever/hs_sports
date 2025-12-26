import { json, bad, uid, hashPassword, signJWT, setAuthCookie } from "../_util.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON.");

  const username = String(body.username || "").trim();
  const password = String(body.password || "").trim();

  if (username.length < 3) return bad("Username must be at least 3 characters.");
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return bad("Username can only use letters, numbers, and underscores.");
  if (password.length < 8) return bad("Password must be at least 8 characters.");

  const existing = await env.DB.prepare(
    "SELECT id FROM users WHERE LOWER(username)=LOWER(?) LIMIT 1"
  ).bind(username).first();

  if (existing) return bad("That username is already taken.");

  const id = uid();
  const pass_hash = await hashPassword(password);
  const now = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO users (id, username, pass_hash, created_at) VALUES (?, ?, ?, ?)"
  ).bind(id, username, pass_hash, now).run();

  const token = await signJWT(env, { sub: id, username });
  return json(
    { ok: true, user: { id, username } },
    { headers: setAuthCookie(env, token) }
  );
}
