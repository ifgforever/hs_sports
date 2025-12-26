import { json, bad, verifyPassword, signJWT, setAuthCookie } from "../_util.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  if (!username || !password) {
    return bad("Missing credentials");
  }

  const user = await env.DB
    .prepare("SELECT id, username, pass_hash FROM users WHERE LOWER(username)=LOWER(?)")
    .bind(username)
    .first();

  if (!user) return bad("Invalid username or password", 401);

  const ok = await verifyPassword(password, user.pass_hash);
  if (!ok) return bad("Invalid username or password", 401);

  const token = await signJWT(env, { sub: user.id, username: user.username });

  return json(
    { ok: true, user: { id: user.id, username: user.username } },
    { headers: setAuthCookie(env, token) }
  );
}
