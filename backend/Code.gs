// gwen-stuff backend: a tiny key/value store in a Google Sheet.
// Each app gets its own tab. Each row is one entry: Updated | Key | Data (JSON).
// Deploy: Extensions > Apps Script in the Sheet, paste this, then
// Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.

// Apps allowed to store data, with the most JSON bytes one entry may hold.
const APPS = {
  'snoopy-vote': { maxBytes: 2000 }
};

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function tab_(app) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(app);
  if (!sh) {
    sh = ss.insertSheet(app);
    sh.appendRow(['Updated', 'Key', 'Data']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function list_(app) {
  const rows = tab_(app).getDataRange().getValues().slice(1);
  const out = [];
  rows.forEach(r => {
    const key = String(r[1]).trim();
    if (!key) return;
    try { out.push({ key: key, data: JSON.parse(r[2]), updated: r[0] }); } catch (e) {}
  });
  return out;
}

// GET ?app=snoopy-vote  ->  { ok: true, entries: [...] }
function doGet(e) {
  const app = e && e.parameter && e.parameter.app;
  if (!APPS[app]) return json_({ ok: false, error: 'unknown app' });
  return json_({ ok: true, entries: list_(app) });
}

// POST body (sent as text/plain): { app, action: 'put', key, data }
// To remove an entry, delete its row in the Sheet.
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  const app = body.app;
  const cfg = APPS[app];
  if (!cfg) return json_({ ok: false, error: 'unknown app' });
  const key = String(body.key || '').trim().slice(0, 60);
  if (!key) return json_({ ok: false, error: 'missing key' });

  if (body.action !== 'put') return json_({ ok: false, error: 'bad action' });
  const dataStr = JSON.stringify(body.data == null ? {} : body.data);
  if (dataStr.length > cfg.maxBytes) return json_({ ok: false, error: 'too big' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = tab_(app);
    const last = sh.getLastRow();
    const keys = last > 1 ? sh.getRange(2, 2, last - 1, 1).getValues().map(r => String(r[0]).trim().toLowerCase()) : [];
    const i = keys.indexOf(key.toLowerCase());
    const row = [new Date(), key, dataStr];
    if (i >= 0) sh.getRange(i + 2, 1, 1, 3).setValues([row]);
    else sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, entries: list_(app) });
}
