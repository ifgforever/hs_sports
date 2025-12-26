import { json, bad, uid, requireUser } from "../_util.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const channel_id = url.searchParams.get("channel_id");
  if (!channel_id) return bad("channel_id required.");

  const rows = (await env.DB.prepare(
   `SELECT c.id, c.body, c.created_at, u.username AS author_email
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.channel_id=? AND c.status='visible'
     ORDER BY c.created_at DESC
     LIMIT 200`
  ).bind(channel_id).all()).results || [];

  return json({ ok: true, comments: rows });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await requireUser(context);
  if (!user) return bad("Login required to comment.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const channel_id = String(body.channel_id || "").trim();
  const text = String(body.body || "").trim();

  if (!channel_id) return bad("channel_id required.");
  if (text.length < 3) return bad("Comment too short.");
  if (text.length > 1000) return bad("Comment too long.");

  const exists = await env.DB.prepare("SELECT id FROM channels WHERE id=? AND status='active'")
    .bind(channel_id)
    .first();
  if (!exists) return bad("Channel not found.", 404);

  const id = uid();
  const now = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO comments (id, channel_id, user_id, body, status, created_at) VALUES (?, ?, ?, ?, 'visible', ?)"
  ).bind(id, channel_id, user.sub, text, now).run();

  return json({ ok: true, id });
}

