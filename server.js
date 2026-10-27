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
      clearTokenCookie(res);
      res.status(401).json({ error: 'Todoist rejected the token. Reconnect your account.' });
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

app.post('/api/connect', wrap(async (req, res) => {
  const candidate = String(req.body?.token || '').trim();
  if (!candidate) return res.status(400).json({ error: 'Token is required' });
  try {
    await td('GET', '/projects', { query: { limit: 1 }, auth: candidate });
  } catch (err) {
    return res.status(400).json({ error: 'That token did not work with Todoist.' });
  }
  setTokenCookie(req, res, candidate);
  req.userId = userIdFor(candidate);
  adoptLegacyDrawings(req);
  res.json({ connected: true });
}));

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
  setTokenCookie(req, res, data.access_token);
  req.userId = userIdFor(data.access_token);
  adoptLegacyDrawings(req);
  res.redirect('/');
}));

// Everything the UI needs on load, in one round trip.
app.get('/api/bootstrap', requireToken, wrap(async (req, res) => {
  const [projects, sections, labels, tasks] = await Promise.all([
    tdAll(req.token, '/projects'),
    tdAll(req.token, '/sections'),
    tdAll(req.token, '/labels'),
    tdAll(req.token, '/tasks'),
  ]);
  res.json({ projects, sections, labels, tasks });
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

app.get('/api/tasks/:id/comments', requireToken, wrap(async (req, res) => {
  res.json({ comments: await tdAll(req.token, '/comments', { task_id: req.params.id }) });
}));

app.post('/api/comments', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/comments', { auth: req.token, body: req.body }));
}));

// ---- drawings (stored per user) ----

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

app.post('/api/drawings', requireToken, express.json({ limit: '25mb' }), (req, res) => {
  const { id, title, task_id, image } = req.body || {};
  const match = /^data:image\/png;base64,(.+)$/.exec(image || '');
  if (!match) return res.status(400).json({ error: 'Expected a PNG data URL' });
  if (id && !validId(id)) return res.status(400).json({ error: 'Bad drawing id' });
  const list = readDrawings(req);
  const now = new Date().toISOString();
  let drawing = id && list.find((d) => d.id === id);
  if (drawing) {
    Object.assign(drawing, { title: title || drawing.title, task_id: task_id || null, updated_at: now });
  } else {
    drawing = { id: crypto.randomBytes(8).toString('hex'), title: title || 'Untitled sketch', task_id: task_id || null, created_at: now, updated_at: now };
    list.unshift(drawing);
  }
  fs.mkdirSync(drawingsDir(req), { recursive: true });
  fs.writeFileSync(drawingFile(req, drawing.id), Buffer.from(match[1], 'base64'));
  writeDrawings(req, list);
  res.json(drawing);
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
