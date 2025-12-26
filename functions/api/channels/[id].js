import { json, bad, requireUser } from "../_util.js";

// GET /api/channels/:id
export async function onRequestGet({ params, env }) {
  const id = params.id;

  const row = await env.DB.prepare(
    `SELECT id, user_id, display_name, youtube_url, mission, category, location, contact, status, created_at, updated_at
     FROM channels
     WHERE id=?`
  ).bind(id).first();

  if (!row || row.status !== "active") return bad("Channel not found.", 404);
  return json({ ok: true, channel: row });
}

// PUT /api/channels/:id  (edit/update)
export async function onRequestPut(context) {
  const { request, env, params } = context;

  const user = await requireUser(context);
  if (!user) return bad("Login required.", 401);

  const id = params.id;

  const existing = await env.DB.prepare(
    "SELECT id, user_id, status FROM channels WHERE id=?"
  ).bind(id).first();

  if (!existing) return bad("Not found.", 404);
  if (existing.status !== "active") return bad("Channel not found.", 404);
  if (existing.user_id !== user.sub) return bad("Forbidden.", 403);

  const body = await request.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const display_name = String(body.display_name || "").trim();
  const youtube_url = String(body.youtube_url || "").trim();
  const mission = String(body.mission || "").trim();
  const category = String(body.category || "").trim();
  const location = String(body.location || "").trim();
  const contact = String(body.contact || "").trim();

  if (!display_name) return bad("Display name is required.");
  if (!youtube_url || !youtube_url.includes("youtube.com")) return bad("Enter a valid YouTube channel URL.");
  if (mission.length < 40) return bad("Mission should be at least 40 characters.");
  if (!category) return bad("Category is required.");

  const now = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE channels SET
      display_name=?,
      youtube_url=?,
      mission=?,
      category=?,
      location=?,
      contact=?,
      updated_at=?
     WHERE id=?`
  ).bind(
    display_name,
    youtube_url,
    mission,
    category,
    location || null,
    contact || null,
    now,
    id
  ).run();

  return json({ ok: true });
}

// DELETE /api/channels/:id  (owner-only soft delete)
export async function onRequestDelete(context) {
  const { env, params } = context;

  const user = await requireUser(context);
  if (!user) return bad("Login required.", 401);

  const id = params.id;

  const existing = await env.DB.prepare(
    "SELECT id, user_id, status FROM channels WHERE id=?"
  ).bind(id).first();

  if (!existing) return bad("Not found.", 404);
  if (existing.user_id !== user.sub) return bad("Forbidden.", 403);

  // Soft delete: hide everywhere that checks status='active'
  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE channels SET status='deleted', updated_at=? WHERE id=?"
  ).bind(now, id).run();

  return json({ ok: true });
}
