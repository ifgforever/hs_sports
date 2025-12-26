import { json, bad, requireUser } from "../_util.js";

export async function onRequestGet({ params, env }) {
  const id = params.id;

  const row = await env.DB.prepare(
    `SELECT id, display_name, youtube_url, mission, category, location, contact, status, created_at
     FROM channels
     WHERE id = ?`
  ).bind(id).first();

  if (!row) return bad("Not found", 404);
  if (row.status !== "active") return bad("Not found", 404);

  return json({ ok: true, channel: row });
}

// ✅ Soft delete: only the owner OR an admin token can delete
export async function onRequestDelete(context) {
  const { request, params, env } = context;
  const id = params.id;

  const user = await requireUser(context);
  if (!user) return bad("Login required", 401);

  const row = await env.DB.prepare(
    `SELECT id, user_id, status FROM channels WHERE id = ?`
  ).bind(id).first();

  if (!row) return bad("Not found", 404);

  const adminToken = request.headers.get("x-admin-token") || "";
  const isAdmin = env.ADMIN_TOKEN && adminToken === env.ADMIN_TOKEN;
  const isOwner = row.user_id === user.sub;

  if (!isOwner && !isAdmin) return bad("Not allowed", 403);

  await env.DB.prepare(
    `UPDATE channels SET status='deleted', updated_at=? WHERE id=?`
  ).bind(new Date().toISOString(), id).run();

  return json({ ok: true });
}
