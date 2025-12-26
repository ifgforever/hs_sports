import { json, bad, requireUser } from "../_util.js";

export async function onRequestGet({ params, env }) {
  const id = params.id;

  const row = await env.DB.prepare(
    `SELECT id, user_id, display_name, youtube_url, mission, category, location, contact, status, created_at
     FROM channels
     WHERE id = ? AND status='active'
     LIMIT 1`
  ).bind(id).first();

  if (!row) return bad("Not found", 404);
  return json({ ok: true, channel: row });
}

export async function onRequestDelete(context) {
  const { params, env } = context;
  const id = params.id;

  const user = await requireUser(context);
  if (!user) return bad("Login required.", 401);

  // Only the owner can delete their post
  const row = await env.DB.prepare(
    `SELECT id, user_id FROM channels WHERE id = ? LIMIT 1`
  ).bind(id).first();

  if (!row) return bad("Not found", 404);
  if (row.user_id !== user.sub) return bad("Not allowed", 403);

  // Soft delete the channel (keeps history / avoids breaking links)
  await env.DB.prepare(
    `UPDATE channels
     SET status='deleted', updated_at=?
     WHERE id=?`
  ).bind(new Date().toISOString(), id).run();

  // Optional: delete comments for that channel (keeps UI clean)
  await env.DB.prepare(
    `DELETE FROM comments WHERE channel_id=?`
  ).bind(id).run();

  return json({ ok: true });
}
