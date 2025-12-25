export async function onRequest(context) {
  const res = await context.next();
  const out = new Response(res.body, res);

  out.headers.set("X-Content-Type-Options", "nosniff");
  out.headers.set("X-Frame-Options", "DENY");
  out.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return out;
}

