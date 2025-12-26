import { json, clearAuthCookie } from "../_util.js";

export async function onRequestPost({ env }) {
  return json({ ok: true }, { headers: clearAuthCookie(env) });
}
