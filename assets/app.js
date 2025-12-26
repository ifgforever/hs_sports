async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
    ...opts,
  });

  const data = await res.json().catch(() => ({ ok: false, error: "Bad JSON" }));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

async function getMe() {
  const { user } = await api("/api/auth/me", { method: "GET" });
  return user;
}

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return [...document.querySelectorAll(sel)]; }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

// NEW: nav initializer
async function initNav() {
  const loginLink = qs("#loginLink");
  const logoutLink = qs("#logoutLink");

  // If a page doesn’t have these, do nothing.
  if (!loginLink && !logoutLink) return;

  const user = await getMe().catch(() => null);

  if (user) {
    if (loginLink) loginLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline-block";
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "none";
  }
}

window.APP = { api, getMe, qs, qsa, escapeHtml, initNav };
