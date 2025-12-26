import { json } from "../_util.js";
import { requireUser } from "../_util.js";

export async function onRequestGet(context) {
  const user = await requireUser(context);
  if (!user) return json({ ok: true, user: null });
  return json({ ok: true, user: { id: user.sub, email: user.email } });
}

