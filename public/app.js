window.APP = {
  qs: (s) => document.querySelector(s),

  get token() {
    return localStorage.getItem("token");
  },

  set token(v) {
    if (v) localStorage.setItem("token", v);
    else localStorage.removeItem("token");
  },

  async api(url, opts = {}) {
    opts.headers ||= {};
    opts.headers["Content-Type"] = "application/json";
    if (this.token) opts.headers.Authorization = "Bearer " + this.token;

    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  },

  async getMe() {
    const res = await this.api("/api/auth/me");
    return res.user;
  }
};
