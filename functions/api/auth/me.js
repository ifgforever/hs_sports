import { json } from "../_util.js";
import { requireUser } from "../_util.js";

export async function onRequestGet({ request, env }) {
  const user = await requireUser({ request, env });
  if (!user) return json({ ok: true, user: null });
  return json({ ok: true, user: { id: user.sub, username: user.username } });
}
