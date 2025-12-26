import { json, bad, uid } from "../../_util.js";
import bcrypt from "bcryptjs";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  if (!username || username.length < 3) {
    return bad("Username must be at least 3 characters.");
  }

  if (!password || password.length < 6) {
    return bad("Password must be at least 6 characters.");
  }

  // check if username exists
  const existing = await env.DB
    .prepare("SELECT id FROM users WHERE username=?")
    .bind(username)
    .first();

  if (existing) return bad("Username already taken.");

  const hash = await bcrypt.hash(password, 10);
  const id = uid();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO users (id, username, password_hash, created_at)
     VALUES (?, ?, ?, ?)`
  ).bind(id, username, hash, now).run();

  return json({ ok: true });
}
