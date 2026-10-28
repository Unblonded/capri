import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3300;
// 0.0.0.0 lets other computers (like the Capri desktop app) reach this server; set HOST=127.0.0.1 to keep it local.
const HOST = process.env.HOST || '0.0.0.0';
const TODOIST_API = 'https://api.todoist.com/api/v1';
const DATA_DIR = process.env.CAPRI_DATA_DIR || path.join(__dirname, 'data');

// ---- users ----
// There are no Capri accounts or passwords: your Todoist token is your login. Each browser keeps its own
// token in an HttpOnly cookie, and anything Capri stores (like sketches) lives under a one-way hash of
// that token, so the raw token is never written to disk.

const TOKEN_COOKIE = 'capri_token';
const userIdFor = (token) => crypto.createHash('sha256').update(`capri:${token}`).digest('hex').slice(0, 32);
const userDir = (req) => path.join(DATA_DIR, 'users', req.userId);

function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

// Over https (your domain) the cookie is never sent unencrypted.
function setTokenCookie(req, res, token) {
  res.append('Set-Cookie', `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${req.secure ? '; Secure' : ''}`);
}

function clearTokenCookie(res) {
  res.append('Set-Cookie', `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// Older versions kept a single token on disk and one shared sketch folder. Hand those sketches to the
// first person who connects, and stop keeping a plaintext token around.
const LEGACY_TOKEN = path.join(DATA_DIR, 'token.json');
const LEGACY_DRAWINGS = path.join(DATA_DIR, 'drawings');
if (fs.existsSync(LEGACY_TOKEN)) {
  fs.rmSync(LEGACY_TOKEN, { force: true });
  console.log('Removed the old shared token file; each person now signs in with their own token.');
}
function adoptLegacyDrawings(req) {
  const target = path.join(userDir(req), 'drawings');
  if (fs.existsSync(LEGACY_DRAWINGS) && !fs.existsSync(target)) {
    fs.mkdirSync(userDir(req), { recursive: true });
    fs.renameSync(LEGACY_DRAWINGS, target);
  }
}

// ---- Todoist client ----

class TodoistError extends Error {
  constructor(status, body) {
    super(`Todoist API ${status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

async function td(method, pathname, { query, body, auth } = {}) {
  const url = new URL(TODOIST_API + pathname);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${auth}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch { /* plain text */ }
  if (!res.ok) throw new TodoistError(res.status, data);
  return data;
}

// Follows next_cursor until every page of a list endpoint is collected.
async function tdAll(auth, pathname, query = {}, key = 'results') {
  const out = [];
  let cursor;
  do {
    const page = await td('GET', pathname, { auth, query: { ...query, limit: 200, cursor } });
    out.push(...(page[key] || []));
    cursor = page.next_cursor;
  } while (cursor);
  return out;
}

// ---- app ----

const app = express();
// Behind a reverse proxy / tunnel (Caddy, nginx, Cloudflare), trust it to report the real client IP and https.
app.set('trust proxy', process.env.TRUST_PROXY ?? 'loopback, linklocal, uniquelocal');
// Drawings carry big image payloads and get their own body limit below.
app.use((req, res, next) => (req.path === '/api/drawings' ? next() : express.json()(req, res, next)));

// Who's asking: the token from their cookie, and the storage id derived from it.
app.use((req, res, next) => {
  req.token = readCookie(req, TOKEN_COOKIE);
  req.userId = req.token ? userIdFor(req.token) : null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// The Windows app updates itself from here: `npm run update` on a Windows server builds it into dist/.
// Only the update manifest and installer files are exposed.
app.use('/updates', (req, res, next) => {
  if (!/^\/(latest\.yml|Capri-Setup-[\w.-]+\.exe(\.blockmap)?)$/.test(req.path)) return res.status(404).end();
  res.set('Cache-Control', 'no-cache');
  next();
}, express.static(path.join(__dirname, 'dist'), { index: false, dotfiles: 'deny' }));

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    const status = err.status || 500;
    if (status === 401 || status === 403) {
      // The cookie stays: entering a new token on this device can then bring this token's Capri data along.
      res.status(401).json({ error: 'Your Todoist token has expired or was changed.', expired: true });
      return;
    }
    console.error(err);
    res.status(status).json({ error: err.message, details: err.body });
  });

const requireToken = (req, res, next) => {
  if (!req.token) return res.status(401).json({ error: 'Not connected to Todoist' });
  next();
};

app.get('/api/status', (req, res) => {
  res.json({
    connected: Boolean(req.token),
    oauthAvailable: Boolean(process.env.TODOIST_CLIENT_ID && process.env.TODOIST_CLIENT_SECRET),
  });
});

// Which Todoist account a token belongs to, or null if Todoist won't say. Throws if the token is rejected.
async function accountOf(token) {
  try {
    const user = await td('GET', '/user', { auth: token });
    return user?.id != null ? String(user.id) : null;
  } catch (err) {
    if (err.status === 401 || err.status === 403) throw err;
    await td('GET', '/projects', { query: { limit: 1 }, auth: token }); // still check the token works
    return null;
  }
}

// Each data folder notes which Todoist account it belongs to, so a replacement token can claim it.
const metaFile = (dir) => path.join(dir, 'meta.json');
const accountOfDir = (dir) => { try { return JSON.parse(fs.readFileSync(metaFile(dir), 'utf8')).account || null; } catch { return null; } };
function rememberAccount(userId, account) {
  if (!account) return;
  const dir = path.join(DATA_DIR, 'users', userId);
  if (accountOfDir(dir) === account) return;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(metaFile(dir), JSON.stringify({ account }, null, 2));
}

// Signing in with a new token on a device that still has the old one (it expired, or you regenerated it):
// if both belong to the same Todoist account, the old token's notes, schedule and settings move across.
function carryOver(oldToken, newToken, account) {
  if (!oldToken || !account || oldToken === newToken) return false;
  const from = path.join(DATA_DIR, 'users', userIdFor(oldToken));
  const to = path.join(DATA_DIR, 'users', userIdFor(newToken));
  if (!fs.existsSync(from) || accountOfDir(from) !== account) return false;
  if (fs.existsSync(to) && fs.readdirSync(to).some((f) => f !== 'meta.json')) return false; // never overwrite
  fs.rmSync(to, { recursive: true, force: true });
  fs.renameSync(from, to);
  return true;
}

async function signIn(req, res, token) {
  const account = await accountOf(token);
  const carried = carryOver(req.token, token, account);
  setTokenCookie(req, res, token);
  req.token = token;
  req.userId = userIdFor(token);
  rememberAccount(req.userId, account);
  adoptLegacyDrawings(req);
  return { carried };
}

app.post('/api/connect', async (req, res) => {
  const candidate = String(req.body?.token || '').trim();
  if (!candidate) return res.status(400).json({ error: 'Token is required' });
  try {
    const { carried } = await signIn(req, res, candidate);
    res.json({ connected: true, carried });
  } catch (err) {
    if (err.status === 401 || err.status === 403) return res.status(400).json({ error: 'That token did not work with Todoist.' });
    console.error(err);
    res.status(502).json({ error: 'Couldn’t reach Todoist. Try again in a moment.' });
  }
});

app.post('/api/disconnect', (req, res) => {
  clearTokenCookie(res);
  res.json({ connected: false });
});

// OAuth "Sign in with Todoist"
const oauthStates = new Set();

app.get('/auth/login', (req, res) => {
  if (!process.env.TODOIST_CLIENT_ID) return res.status(400).send('OAuth is not configured. See .env.example.');
  const state = crypto.randomBytes(16).toString('hex');
  oauthStates.add(state);
  const url = new URL('https://todoist.com/oauth/authorize');
  url.searchParams.set('client_id', process.env.TODOIST_CLIENT_ID);
  url.searchParams.set('scope', 'data:read_write,data:delete');
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/auth/callback', wrap(async (req, res) => {
  const { code, state } = req.query;
  if (!state || !oauthStates.delete(state)) return res.status(400).send('Invalid OAuth state. Try again.');
  if (!code) return res.status(400).send('Missing authorization code.');
  const r = await fetch('https://todoist.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TODOIST_CLIENT_ID,
      client_secret: process.env.TODOIST_CLIENT_SECRET,
      code,
    }),
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) return res.status(400).send('Todoist did not return a token.');
  await signIn(req, res, data.access_token);
  res.redirect('/');
}));

// Everything the UI needs on load, in one round trip.
// Phone and desktop both sync every few seconds. Requests for the same account that land within a
// couple of seconds share one trip to Todoist, which keeps syncs quick and well inside its rate limit.
// Any change made through Capri drops the shared copy, so the next sync is always fresh.
const BOOTSTRAP_SHARE_MS = 2500;
const bootstrapShared = new Map(); // user id → { at, data: Promise }
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' && req.token) bootstrapShared.delete(userIdFor(req.token));
  next();
});

// Folders made before accounts were noted get their note the first time they load.
const noted = new Set();
app.get('/api/bootstrap', requireToken, wrap(async (req, res) => {
  const key = userIdFor(req.token);
  if (!noted.has(key)) {
    noted.add(key);
    if (!accountOfDir(userDir(req))) accountOf(req.token).then((a) => rememberAccount(key, a)).catch(() => noted.delete(key));
  }
  let hit = bootstrapShared.get(key);
  if (!hit || Date.now() - hit.at > BOOTSTRAP_SHARE_MS) {
    const data = Promise.all([
      tdAll(req.token, '/projects'),
      tdAll(req.token, '/sections'),
      tdAll(req.token, '/labels'),
      tdAll(req.token, '/tasks'),
    ]).then(([projects, sections, labels, tasks]) => ({ projects, sections, labels, tasks }));
    hit = { at: Date.now(), data };
    bootstrapShared.set(key, hit);
    data.catch(() => { if (bootstrapShared.get(key) === hit) bootstrapShared.delete(key); });
    setTimeout(() => { if (bootstrapShared.get(key) === hit) bootstrapShared.delete(key); }, BOOTSTRAP_SHARE_MS * 2).unref();
  }
  res.json(await hit.data);
}));

app.get('/api/completed', requireToken, wrap(async (req, res) => {
  const until = req.query.until || new Date().toISOString();
  const since = req.query.since || new Date(Date.now() - 7 * 864e5).toISOString();
  const items = await tdAll(req.token, '/tasks/completed/by_completion_date', { since, until }, 'items');
  res.json({ items });
}));

app.get('/api/filter', requireToken, wrap(async (req, res) => {
  const tasks = await tdAll(req.token, '/tasks/filter', { query: req.query.query });
  res.json({ tasks });
}));

app.post('/api/tasks/quick', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/tasks/quick', { auth: req.token, body: { text: req.body.text } }));
}));

app.post('/api/tasks', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/tasks', { auth: req.token, body: req.body }));
}));

app.post('/api/tasks/:id', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', `/tasks/${encodeURIComponent(req.params.id)}`, { auth: req.token, body: req.body }));
}));

// Moving between projects/sections/parents is a separate endpoint from update.
app.post('/api/tasks/:id/move', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', `/tasks/${encodeURIComponent(req.params.id)}/move`, { auth: req.token, body: req.body }));
}));

app.post('/api/tasks/:id/close', requireToken, wrap(async (req, res) => {
  await td('POST', `/tasks/${encodeURIComponent(req.params.id)}/close`, { auth: req.token });
  res.json({ ok: true });
}));

app.post('/api/tasks/:id/reopen', requireToken, wrap(async (req, res) => {
  await td('POST', `/tasks/${encodeURIComponent(req.params.id)}/reopen`, { auth: req.token });
  res.json({ ok: true });
}));

app.delete('/api/tasks/:id', requireToken, wrap(async (req, res) => {
  await td('DELETE', `/tasks/${encodeURIComponent(req.params.id)}`, { auth: req.token });
  res.json({ ok: true });
}));

app.post('/api/projects', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/projects', { auth: req.token, body: req.body }));
}));

app.post('/api/sections', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/sections', { auth: req.token, body: req.body }));
}));

// The REST API can't reorder sections, so this one goes through Todoist's sync endpoint.
app.post('/api/sections/reorder', requireToken, wrap(async (req, res) => {
  const uuid = crypto.randomUUID();
  const commands = [{ type: 'section_reorder', uuid, args: { sections: req.body.sections } }];
  const r = await fetch(TODOIST_API + '/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${req.token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ commands: JSON.stringify(commands) }),
  });
  const data = await r.json().catch(() => null);
  const status = data?.sync_status?.[uuid];
  if (!r.ok || status !== 'ok') throw new TodoistError(r.ok ? 400 : r.status, status?.error || data);
  res.json({ ok: true });
}));

app.post('/api/sections/:id', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', `/sections/${encodeURIComponent(req.params.id)}`, { auth: req.token, body: { name: req.body.name } }));
}));

app.delete('/api/sections/:id', requireToken, wrap(async (req, res) => {
  await td('DELETE', `/sections/${encodeURIComponent(req.params.id)}`, { auth: req.token });
  res.json({ ok: true });
}));

app.get('/api/tasks/:id/comments', requireToken, wrap(async (req, res) => {
  res.json({ comments: await tdAll(req.token, '/comments', { task_id: req.params.id }) });
}));

app.post('/api/comments', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/comments', { auth: req.token, body: req.body }));
}));

// ---- notes: sketches and written notes (stored per user) ----

const drawingsDir = (req) => path.join(userDir(req), 'drawings');
const drawingFile = (req, id) => path.join(drawingsDir(req), `${id}.png`);
const validId = (id) => /^[a-f0-9]{16}$/.test(id);

function readDrawings(req) {
  try { return JSON.parse(fs.readFileSync(path.join(drawingsDir(req), 'index.json'), 'utf8')); } catch { return []; }
}

function writeDrawings(req, list) {
  fs.mkdirSync(drawingsDir(req), { recursive: true });
  fs.writeFileSync(path.join(drawingsDir(req), 'index.json'), JSON.stringify(list, null, 2));
}

app.get('/api/drawings', requireToken, (req, res) => res.json({ drawings: readDrawings(req) }));

app.get('/api/drawings/:id.png', requireToken, (req, res) => {
  if (!validId(req.params.id)) return res.status(404).end();
  res.set('Cache-Control', 'private, no-cache');
  res.sendFile(drawingFile(req, req.params.id), (err) => err && res.status(404).end());
});

// Notes are either sketches (a PNG beside the index) or written notes (`kind: 'text'`, the text kept in the index).
app.post('/api/drawings', requireToken, express.json({ limit: '25mb' }), (req, res) => {
  const { id, title, task_id, image, text } = req.body || {};
  const written = typeof text === 'string';
  const match = !written && /^data:image\/png;base64,(.+)$/.exec(image || '');
  if (!written && !match) return res.status(400).json({ error: 'Expected a PNG data URL or text' });
  if (written && text.length > 200000) return res.status(400).json({ error: 'Note too long' });
  if (id && !validId(id)) return res.status(400).json({ error: 'Bad drawing id' });
  const list = readDrawings(req);
  const now = new Date().toISOString();
  let drawing = id && list.find((d) => d.id === id);
  if (drawing) {
    Object.assign(drawing, { title: title || drawing.title, task_id: task_id || null, updated_at: now });
  } else {
    drawing = { id: crypto.randomBytes(8).toString('hex'), title: title || (written ? 'Untitled note' : 'Untitled sketch'), task_id: task_id || null, created_at: now, updated_at: now };
    list.unshift(drawing);
  }
  fs.mkdirSync(drawingsDir(req), { recursive: true });
  if (written) Object.assign(drawing, { kind: 'text', body: text });
  else fs.writeFileSync(drawingFile(req, drawing.id), Buffer.from(match[1], 'base64'));
  writeDrawings(req, list);
  res.json(drawing);
});

// Rename a note, or attach it to a different task, without sending the whole thing again.
app.post('/api/drawings/:id/meta', requireToken, (req, res) => {
  const { title, task_id } = req.body || {};
  const list = readDrawings(req);
  const drawing = validId(req.params.id) && list.find((d) => d.id === req.params.id);
  if (!drawing) return res.status(404).json({ error: 'No such note' });
  if (typeof title === 'string' && title.trim()) drawing.title = title.trim().slice(0, 200);
  if (task_id !== undefined) drawing.task_id = task_id || null;
  drawing.updated_at = new Date().toISOString();
  writeDrawings(req, list);
  res.json(drawing);
});

// ---- preferences (stored per user), such as the order you've put board columns in ----

const prefsFile = (req) => path.join(userDir(req), 'prefs.json');
function readPrefs(req) {
  try { return JSON.parse(fs.readFileSync(prefsFile(req), 'utf8')); } catch { return {}; }
}

app.get('/api/prefs', requireToken, (req, res) => res.json(readPrefs(req)));

// Sets one key at a time; a null value removes it.
app.post('/api/prefs', requireToken, (req, res) => {
  const { key, value } = req.body || {};
  if (typeof key !== 'string' || !/^[\w:.-]{1,120}$/.test(key)) return res.status(400).json({ error: 'Bad key' });
  if (JSON.stringify(value ?? null).length > 20000) return res.status(400).json({ error: 'Value too large' });
  const prefs = readPrefs(req);
  if (value === null || value === undefined) delete prefs[key];
  else prefs[key] = value;
  fs.mkdirSync(userDir(req), { recursive: true });
  fs.writeFileSync(prefsFile(req), JSON.stringify(prefs, null, 2));
  res.json({ ok: true });
});

// ---- deadlines (stored per user): task id → YYYY-MM-DD ----
// Todoist only has deadlines on Pro, so Capri keeps its own.

const deadlinesFile = (req) => path.join(userDir(req), 'deadlines.json');
function readDeadlines(req) {
  try { return JSON.parse(fs.readFileSync(deadlinesFile(req), 'utf8')); } catch { return {}; }
}

app.get('/api/deadlines', requireToken, (req, res) => res.json(readDeadlines(req)));

// { set: { taskId: 'YYYY-MM-DD' | null, … } }
app.post('/api/deadlines', requireToken, (req, res) => {
  const set = req.body?.set;
  if (!set || typeof set !== 'object') return res.status(400).json({ error: 'Expected { set }' });
  const all = readDeadlines(req);
  for (const [id, date] of Object.entries(set)) {
    if (!/^[\w-]{1,64}$/.test(id)) return res.status(400).json({ error: 'Bad task id' });
    if (date === null) delete all[id];
    else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) all[id] = date;
    else return res.status(400).json({ error: 'Bad date' });
  }
  fs.mkdirSync(userDir(req), { recursive: true });
  fs.writeFileSync(deadlinesFile(req), JSON.stringify(all, null, 2));
  res.json({ ok: true });
});

// ---- schedule (stored per user): day → time blocks like "go outside 15:05–16:03" ----

const scheduleFile = (req) => path.join(userDir(req), 'schedule.json');
function readSchedule(req) {
  try { return JSON.parse(fs.readFileSync(scheduleFile(req), 'utf8')); } catch { return {}; }
}

app.get('/api/schedule', requireToken, (req, res) => res.json(readSchedule(req)));

// { day: 'YYYY-MM-DD', blocks: [{ id, title, start: 'HH:MM', end: 'HH:MM', done? }] } replaces that day's blocks.
app.post('/api/schedule', requireToken, (req, res) => {
  const { day, blocks } = req.body || {};
  const hhmm = (t) => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return res.status(400).json({ error: 'Bad day' });
  if (!Array.isArray(blocks) || blocks.length > 100) return res.status(400).json({ error: 'Expected up to 100 blocks' });
  const clean = [];
  for (const b of blocks) {
    if (!b || typeof b.title !== 'string' || !b.title.trim() || !hhmm(b.start) || !hhmm(b.end) || !/^[\w-]{1,40}$/.test(b.id || '')) {
      return res.status(400).json({ error: 'Bad block' });
    }
    clean.push({ id: b.id, title: b.title.trim().slice(0, 200), start: b.start, end: b.end, ...(b.done ? { done: true } : {}) });
  }
  const all = readSchedule(req);
  if (clean.length) all[day] = clean;
  else delete all[day];
  fs.mkdirSync(userDir(req), { recursive: true });
  fs.writeFileSync(scheduleFile(req), JSON.stringify(all, null, 2));
  res.json({ ok: true });
});

app.delete('/api/drawings/:id', requireToken, (req, res) => {
  if (!validId(req.params.id)) return res.status(404).end();
  writeDrawings(req, readDrawings(req).filter((d) => d.id !== req.params.id));
  fs.rmSync(drawingFile(req, req.params.id), { force: true });
  res.json({ ok: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, HOST, () => {
  console.log(`Capri running at http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    const lan = Object.values(os.networkInterfaces()).flat()
      .filter((n) => n && n.family === 'IPv4' && !n.internal).map((n) => `http://${n.address}:${PORT}`);
    if (lan.length) console.log(`Other computers can use: ${lan.join('  ')}`);
  }
  console.log('Each person signs in with their own Todoist API token.');
});
