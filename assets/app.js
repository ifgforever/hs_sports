async function api(path, opts={}) {
  const res = await fetch(path, {
    headers: { "content-type":"application/json", ...(opts.headers||{}) },
    credentials: "include",
    ...opts
  });
  const data = await res.json().catch(()=>({ok:false,error:"Bad JSON"}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

async function getMe() {
  const { user } = await api("/api/auth/me", { method:"GET" });
  return user;
}

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

window.APP = { api, getMe, qs, qsa, escapeHtml };

