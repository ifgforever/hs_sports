import { json, bad, uid, requireUser } from "../_util.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "").trim();
  const location = (url.searchParams.get("location") || "").trim();

  let where = "WHERE status='active'";
  const binds = [];

  if (category) { where += " AND category=?"; binds.push(category); }
  if (location) { where += " AND (location LIKE ? )"; binds.push(`%${location}%`); }
  if (q) {
    where += " AND (LOWER(display_name) LIKE ? OR LOWER(mission) LIKE ? OR LOWER(youtube_url) LIKE ?)";
    binds.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const stmt = env.DB.prepare(
    `SELECT id, display_name, youtube_url, mission, category, location, created_at
     FROM channels ${where}
     ORDER BY created_at DESC
     LIMIT 200`
  ).bind(...binds);

  const rows = (await stmt.all()).results || [];
  return json({ ok: true, channels: rows });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await requireUser(context);
  if (!user) return bad("Login required.", 401);

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

  const id = uid();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO channels
     (id, user_id, display_name, youtube_url, mission, category, location, contact, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
  ).bind(id, user.sub, display_name, youtube_url, mission, category, location || null, contact || null, now, now).run();

  return json({ ok: true, id });
}

