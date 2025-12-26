import jwt from "@tsndr/cloudflare-worker-jwt";

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function bad(message, status = 400) {
  return json({ ok: false, message }, status);
}

export function uid() {
  return crypto.randomUUID();
}

/* ================= JWT ================= */

const JWT_SECRET = "CHANGE_ME_TO_A_RANDOM_SECRET";

export async function signJWT(payload) {
  return await jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d"
  });
}

export async function verifyJWT(token) {
  return await jwt.verify(token, JWT_SECRET);
}

export async function requireUser({ request }) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;

  try {
    const token = auth.slice(7);
    const data = await verifyJWT(token);
    return data.payload;
  } catch {
    return null;
  }
}
