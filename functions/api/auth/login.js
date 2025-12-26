import { json, bad, signJWT } from "../../_util.js";
import bcrypt from "bcryptjs";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  if (!username || !password) {
    return bad("Missing credentials");
  }

  const user = await env.DB
    .prepare("SELECT id, password_hash FROM users WHERE username=?")
    .bind(username)
    .first();

  if (!user) return bad("Invalid username or password", 401);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return bad("Invalid username or password", 401);

  const token = await signJWT({
    sub: user.id,
    username
  });

  return json({ ok: true, token });
}
