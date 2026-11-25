// Tiny client for the gwen-stuff backend (backend/Code.gs).
window.GwenAPI = {
  ready() { return !!window.GWEN_API_URL; },
  async list(app) {
    const r = await fetch(window.GWEN_API_URL + '?app=' + encodeURIComponent(app));
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'load failed');
    return j.entries;
  },
  // Sent as text/plain so the browser skips the CORS preflight Apps Script can't answer.
  async put(app, key, data) {
    const r = await fetch(window.GWEN_API_URL, { method: 'POST', body: JSON.stringify({ app, action: 'put', key, data }) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'save failed');
    return j.entries;
  }
};
