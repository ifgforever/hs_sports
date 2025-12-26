import { json, clearAuthCookie } from "../_util.js";

export async function onRequestPost() {
  return json({ ok: true }, { headers: clearAuthCookie() });
}
