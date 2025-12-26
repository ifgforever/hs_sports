import { json, requireUser } from "../../_util.js";

export async function onRequestGet(context) {
  const user = await requireUser(context);
  if (!user) return json({ ok: false }, 401);
  return json({ ok: true, user });
}
