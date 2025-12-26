import { json, clearAuthCookie } from "../_util.js";

export async function onRequestPost({ request, env }) {
  const origin = env.APP_ORIGIN || new URL(request.url).origin;
  return json({ ok: true }, { headers: { "Set-Cookie": clearAuthCookie(origin) } });
}

