import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const TODOIST_API = 'https://api.todoist.com/api/v1';
const DATA_DIR = path.join(__dirname, 'data');
const TOKEN_FILE = path.join(DATA_DIR, 'token.json');

// ---- token storage (single-user, local app) ----

function loadToken() {
  if (process.env.TODOIST_TOKEN) return process.env.TODOIST_TOKEN.trim();
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')).token || null;
  } catch {
    return null;
  }
}

function saveToken(token) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }), { mode: 0o600 });
}

function clearToken() {
  fs.rmSync(TOKEN_FILE, { force: true });
}

let token = loadToken();

// ---- Todoist client ----

class TodoistError extends Error {
  constructor(status, body) {
    super(`Todoist API ${status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

async function td(method, pathname, { query, body, auth = token } = {}) {
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
async function tdAll(pathname, query = {}, key = 'results') {
  const out = [];
  let cursor;
  do {
    const page = await td('GET', pathname, { query: { ...query, limit: 200, cursor } });
    out.push(...(page[key] || []));
    cursor = page.next_cursor;
  } while (cursor);
  return out;
}

// ---- app ----

const app = express();
// Drawings carry big image payloads and get their own body limit below.
app.use((req, res, next) => (req.path === '/api/drawings' ? next() : express.json()(req, res, next)));
app.use(express.static(path.join(__dirname, 'public')));

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    const status = err.status || 500;
    if (status === 401 || status === 403) {
      res.status(401).json({ error: 'Todoist rejected the token. Reconnect your account.' });
      return;
    }
    console.error(err);
    res.status(status).json({ error: err.message, details: err.body });
  });

const requireToken = (req, res, next) => {
  if (!token) return res.status(401).json({ error: 'Not connected to Todoist' });
  next();
};

app.get('/api/status', (req, res) => {
  res.json({
    connected: Boolean(token),
    fromEnv: Boolean(process.env.TODOIST_TOKEN),
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
  token = candidate;
  saveToken(token);
  res.json({ connected: true });
}));

app.post('/api/disconnect', (req, res) => {
  clearToken();
  token = process.env.TODOIST_TOKEN || null;
  res.json({ connected: Boolean(token) });
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
  token = data.access_token;
  saveToken(token);
  res.redirect('/');
}));

// Everything the UI needs on load, in one round trip.
app.get('/api/bootstrap', requireToken, wrap(async (req, res) => {
  const [projects, sections, labels, tasks] = await Promise.all([
    tdAll('/projects'),
    tdAll('/sections'),
    tdAll('/labels'),
    tdAll('/tasks'),
  ]);
  res.json({ projects, sections, labels, tasks });
}));

app.get('/api/completed', requireToken, wrap(async (req, res) => {
  const until = req.query.until || new Date().toISOString();
  const since = req.query.since || new Date(Date.now() - 7 * 864e5).toISOString();
  const items = await tdAll('/tasks/completed/by_completion_date', { since, until }, 'items');
  res.json({ items });
}));

app.get('/api/filter', requireToken, wrap(async (req, res) => {
  const tasks = await tdAll('/tasks/filter', { query: req.query.query });
  res.json({ tasks });
}));

app.post('/api/tasks/quick', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/tasks/quick', { body: { text: req.body.text } }));
}));

app.post('/api/tasks', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/tasks', { body: req.body }));
}));

app.post('/api/tasks/:id', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', `/tasks/${encodeURIComponent(req.params.id)}`, { body: req.body }));
}));

// Moving between projects/sections/parents is a separate endpoint from update.
app.post('/api/tasks/:id/move', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', `/tasks/${encodeURIComponent(req.params.id)}/move`, { body: req.body }));
}));

app.post('/api/tasks/:id/close', requireToken, wrap(async (req, res) => {
  await td('POST', `/tasks/${encodeURIComponent(req.params.id)}/close`);
  res.json({ ok: true });
}));

app.post('/api/tasks/:id/reopen', requireToken, wrap(async (req, res) => {
  await td('POST', `/tasks/${encodeURIComponent(req.params.id)}/reopen`);
  res.json({ ok: true });
}));

app.delete('/api/tasks/:id', requireToken, wrap(async (req, res) => {
  await td('DELETE', `/tasks/${encodeURIComponent(req.params.id)}`);
  res.json({ ok: true });
}));

app.post('/api/projects', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/projects', { body: req.body }));
}));

app.post('/api/sections', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/sections', { body: req.body }));
}));

app.get('/api/tasks/:id/comments', requireToken, wrap(async (req, res) => {
  res.json({ comments: await tdAll('/comments', { task_id: req.params.id }) });
}));

app.post('/api/comments', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/comments', { body: req.body }));
}));

// ---- drawings (stored locally next to the token) ----

const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');
const DRAWINGS_INDEX = path.join(DRAWINGS_DIR, 'index.json');

function readDrawings() {
  try { return JSON.parse(fs.readFileSync(DRAWINGS_INDEX, 'utf8')); } catch { return []; }
}

function writeDrawings(list) {
  fs.mkdirSync(DRAWINGS_DIR, { recursive: true });
  fs.writeFileSync(DRAWINGS_INDEX, JSON.stringify(list, null, 2));
}

const drawingFile = (id) => path.join(DRAWINGS_DIR, `${id}.png`);
const validId = (id) => /^[a-f0-9]{16}$/.test(id);

app.get('/api/drawings', (req, res) => res.json({ drawings: readDrawings() }));

app.get('/api/drawings/:id.png', (req, res) => {
  if (!validId(req.params.id)) return res.status(404).end();
  res.set('Cache-Control', 'no-cache');
  res.sendFile(drawingFile(req.params.id), (err) => err && res.status(404).end());
});

app.post('/api/drawings', express.json({ limit: '25mb' }), (req, res) => {
  const { id, title, task_id, image } = req.body || {};
  const match = /^data:image\/png;base64,(.+)$/.exec(image || '');
  if (!match) return res.status(400).json({ error: 'Expected a PNG data URL' });
  if (id && !validId(id)) return res.status(400).json({ error: 'Bad drawing id' });
  const list = readDrawings();
  const now = new Date().toISOString();
  let drawing = id && list.find((d) => d.id === id);
  if (drawing) {
    Object.assign(drawing, { title: title || drawing.title, task_id: task_id || null, updated_at: now });
  } else {
    drawing = { id: crypto.randomBytes(8).toString('hex'), title: title || 'Untitled sketch', task_id: task_id || null, created_at: now, updated_at: now };
    list.unshift(drawing);
  }
  fs.mkdirSync(DRAWINGS_DIR, { recursive: true });
  fs.writeFileSync(drawingFile(drawing.id), Buffer.from(match[1], 'base64'));
  writeDrawings(list);
  res.json(drawing);
});

app.delete('/api/drawings/:id', (req, res) => {
  if (!validId(req.params.id)) return res.status(404).end();
  writeDrawings(readDrawings().filter((d) => d.id !== req.params.id));
  fs.rmSync(drawingFile(req.params.id), { force: true });
  res.json({ ok: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`Prism running at http://localhost:${PORT}`);
  if (!token) console.log('Not connected yet — open the app and paste your Todoist API token.');
});
