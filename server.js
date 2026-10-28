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
// There are no Capri accounts or passwords: your Todoist token is your login. Signing in checks it with
// Todoist and starts a session: the browser gets a random session id in an HttpOnly cookie, and the
// token stays on the server, encrypted. Signing out ends the session for real (a stolen cookie stops
// working), and "sign out everywhere" ends all of an account's sessions. Anything Capri stores (like
// sketches) lives under a one-way hash of the token.

const SESSION_COOKIE = 'capri_sid';
const LEGACY_COOKIE = 'capri_token'; // older versions kept the token itself in the cookie
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
function setSessionCookie(req, res, sid) {
  res.append('Set-Cookie', `${SESSION_COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${req.secure ? '; Secure' : ''}`);
}
function clearCookie(res, name) {
  res.append('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// Tokens are encrypted on disk with a key from CAPRI_SECRET, or one made on first run in data/secret.key.
function loadSecret() {
  if (process.env.CAPRI_SECRET) return crypto.createHash('sha256').update(process.env.CAPRI_SECRET).digest();
  const file = path.join(DATA_DIR, 'secret.key');
  try { return Buffer.from(fs.readFileSync(file, 'utf8').trim(), 'hex'); } catch { /* first run */ }
  const key = crypto.randomBytes(32);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, key.toString('hex'), { mode: 0o600 });
  return key;
}
const SECRET = loadSecret();
function seal(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', SECRET, iv);
  const body = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString('base64');
}
function unseal(sealed) {
  try {
    const raw = Buffer.from(sealed, 'base64');
    const d = crypto.createDecipheriv('aes-256-gcm', SECRET, raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8');
  } catch { return null; } // a different secret, or a damaged entry
}

// Sessions live in data/sessions.json, keyed by a hash of the session id (the file alone can't sign anyone in).
// One unused for 180 days ends on its own.
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SESSION_IDLE_MS = 180 * 864e5;
const sessions = new Map(); // hash of session id → { t: sealed token, u: user id, at, seen }
try { for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')))) sessions.set(k, v); } catch { /* none yet */ }
let saveSessionsTimer = null;
function writeSessions() {
  saveSessionsTimer = null;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${SESSIONS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(sessions)), { mode: 0o600 });
  fs.renameSync(tmp, SESSIONS_FILE);
}
function saveSessions() {
  clearTimeout(saveSessionsTimer);
  saveSessionsTimer = setTimeout(writeSessions, 200);
}
// A restart (say, the auto-updater) right after a sign-in still keeps that session.
process.on('exit', () => { if (saveSessionsTimer) writeSessions(); });
for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => process.exit(0));
const sidHash = (sid) => crypto.createHash('sha256').update(`capri-sid:${sid}`).digest('hex');
function startSession(token) {
  const sid = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  sessions.set(sidHash(sid), { t: seal(token), u: userIdFor(token), at: now, seen: now });
  saveSessions();
  return sid;
}
function endSession(sid, { everywhere = false } = {}) {
  const key = sid && sidHash(sid);
  const mine = key && sessions.get(key);
  if (!mine) return;
  if (everywhere) { for (const [k, v] of sessions) if (v.u === mine.u) sessions.delete(k); }
  else sessions.delete(key);
  saveSessions();
}
// The token behind a session id, or null. Keeps "last seen" roughly current (at most one write a day).
function tokenFor(sid) {
  if (!sid || !/^[\w-]{43}$/.test(sid)) return null;
  const key = sidHash(sid);
  const s = sessions.get(key);
  if (!s) return null;
  const now = Date.now();
  if (now - s.seen > SESSION_IDLE_MS) { sessions.delete(key); saveSessions(); return null; }
  if (now - s.seen > 864e5) { s.seen = now; saveSessions(); }
  return unseal(s.t);
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

// Browser protections on every response: no other site can frame Capri (no click-jacking), and the page
// may only run its own scripts. The theme snippet inside index.html is allowed by its hash.
const inlineScriptHashes = [...fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => `'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${inlineScriptHashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com", // the service worker caches the fonts
  "media-src 'self' data: blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=15552000');
  next();
});
app.disable('x-powered-by');

// Who's asking: the token behind their session cookie, and the storage id derived from it.
// A cookie from before sessions (the token itself) is checked with Todoist once and swapped for a session,
// so nobody has to sign in again. A made-up token never gets a session, so it can't store anything here.
const upgrading = new Map(); // user id → the check in flight, so a burst of requests shares one
app.use(async (req, res, next) => {
  const sid = readCookie(req, SESSION_COOKIE);
  req.token = tokenFor(sid);
  req.sid = req.token ? sid : null;
  const legacy = !req.token && /^\/(api|auth)\//.test(req.path) && readCookie(req, LEGACY_COOKIE);
  if (legacy) {
    const key = userIdFor(legacy);
    if (!upgrading.has(key)) {
      upgrading.set(key, accountOf(legacy).then(
        (account) => { rememberAccount(key, account); return startSession(legacy); },
        (err) => (err.status === 401 || err.status === 403 ? null : Promise.reject(err)),
      ).finally(() => upgrading.delete(key)));
    }
    try {
      const newSid = await upgrading.get(key);
      if (newSid) { setSessionCookie(req, res, newSid); req.token = legacy; req.sid = newSid; }
      clearCookie(res, LEGACY_COOKIE);
    } catch {
      return res.status(503).json({ error: 'Couldn’t reach Todoist. Try again in a moment.' });
    }
  }
  if (sid && !req.token) clearCookie(res, SESSION_COOKIE); // ended or expired
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
    res.status(status).json({ error: publicMessage(err, status) });
  });
// What the browser is told: Todoist's own short reason when it gave one, never stack details or file paths.
function publicMessage(err, status) {
  if (err instanceof TodoistError) {
    const reason = typeof err.body === 'object' && err.body ? err.body.error || err.body.message : null;
    if (typeof reason === 'string' && reason.length < 200) return `Todoist: ${reason}`;
    return status >= 500 ? 'Todoist had a problem. Try again in a moment.' : `Todoist turned that down (${status}).`;
  }
  return 'Something went wrong on the Capri server. Try again in a moment.';
}

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
  endSession(req.sid); // this device's old session (say, for an expired token) makes way for the new one
  const sid = startSession(token);
  setSessionCookie(req, res, sid);
  clearCookie(res, LEGACY_COOKIE);
  req.token = token;
  req.sid = sid;
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

// { everywhere: true } signs this account out on every device, not just this one.
app.post('/api/disconnect', (req, res) => {
  endSession(req.sid, { everywhere: Boolean(req.body?.everywhere) });
  clearCookie(res, SESSION_COOKIE);
  clearCookie(res, LEGACY_COOKIE);
  res.json({ connected: false });
});

// OAuth "Sign in with Todoist"
// Each sign-in attempt's state is good for 10 minutes, and only so many can wait at once.
const oauthStates = new Map(); // state → expiry
const OAUTH_STATE_MS = 10 * 60000;
function pruneOauthStates() {
  const now = Date.now();
  for (const [k, exp] of oauthStates) if (exp < now) oauthStates.delete(k);
  while (oauthStates.size >= 1000) oauthStates.delete(oauthStates.keys().next().value);
}

app.get('/auth/login', (req, res) => {
  if (!process.env.TODOIST_CLIENT_ID) return res.status(400).send('OAuth is not configured. See .env.example.');
  const state = crypto.randomBytes(16).toString('hex');
  pruneOauthStates();
  oauthStates.set(state, Date.now() + OAUTH_STATE_MS);
  const url = new URL('https://todoist.com/oauth/authorize');
  url.searchParams.set('client_id', process.env.TODOIST_CLIENT_ID);
  url.searchParams.set('scope', 'data:read_write,data:delete');
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/auth/callback', wrap(async (req, res) => {
  const { code, state } = req.query;
  const expires = oauthStates.get(state);
  if (!state || !oauthStates.delete(state) || expires < Date.now()) return res.status(400).send('That sign-in link expired. Try again.');
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

// Labels: create, rename or recolour, delete. Only the name and colour are passed on.
const labelBody = (b) => Object.fromEntries(Object.entries({ name: b?.name, color: b?.color }).filter(([, v]) => typeof v === 'string' && v.trim()));
app.post('/api/labels', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', '/labels', { auth: req.token, body: labelBody(req.body) }));
}));
app.post('/api/labels/:id', requireToken, wrap(async (req, res) => {
  res.json(await td('POST', `/labels/${encodeURIComponent(req.params.id)}`, { auth: req.token, body: labelBody(req.body) }));
}));
app.delete('/api/labels/:id', requireToken, wrap(async (req, res) => {
  await td('DELETE', `/labels/${encodeURIComponent(req.params.id)}`, { auth: req.token });
  res.json({ ok: true });
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
    if (list.length >= 1000) return res.status(400).json({ error: 'You have 1000 notes. Delete some to make room.' });
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

// ---- schedule (stored per user) ----
// Repeating schedules ("Weekdays": Mon–Fri, with time blocks) plus, per date, one-off blocks and which
// blocks were ticked off that day. Older files were just { date: blocks }; those become one-off blocks.

const scheduleFile = (req) => path.join(userDir(req), 'schedule.json');
function readSchedule(req) {
  let raw = {};
  try { raw = JSON.parse(fs.readFileSync(scheduleFile(req), 'utf8')); } catch { /* none yet */ }
  if (Array.isArray(raw.schedules)) return { schedules: raw.schedules, days: raw.days || {} };
  return { schedules: [], days: Object.fromEntries(Object.entries(raw).map(([d, blocks]) => [d, { extra: blocks, done: blocks.filter((b) => b.done).map((b) => b.id) }])) };
}
function writeSchedule(req, data) {
  fs.mkdirSync(userDir(req), { recursive: true });
  fs.writeFileSync(scheduleFile(req), JSON.stringify(data, null, 2));
}

const hhmm = (t) => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
const okId = (id) => typeof id === 'string' && /^[\w-]{1,40}$/.test(id);
function cleanBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length > 100) return null;
  const out = [];
  for (const b of blocks) {
    if (!b || typeof b.title !== 'string' || !b.title.trim() || !hhmm(b.start) || !hhmm(b.end) || !okId(b.id)) return null;
    out.push({ id: b.id, title: b.title.trim().slice(0, 200), start: b.start, end: b.end });
  }
  return out;
}

app.get('/api/schedule', requireToken, (req, res) => res.json(readSchedule(req)));

// { schedules: [{ id, name, days: [0–6], blocks }] } replaces the repeating schedules;
// { day: 'YYYY-MM-DD', extra: blocks, done: [ids] } replaces that date's one-off blocks and ticks.
app.post('/api/schedule', requireToken, (req, res) => {
  const data = readSchedule(req);
  const { schedules, day, extra, done } = req.body || {};
  if (schedules !== undefined) {
    if (!Array.isArray(schedules) || schedules.length > 20) return res.status(400).json({ error: 'Expected up to 20 schedules' });
    const clean = [];
    for (const s of schedules) {
      const blocks = cleanBlocks(s?.blocks);
      if (!blocks || !okId(s.id) || typeof s.name !== 'string' || !Array.isArray(s.days)) return res.status(400).json({ error: 'Bad schedule' });
      clean.push({ id: s.id, name: s.name.trim().slice(0, 60) || 'Schedule', days: [...new Set(s.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))], blocks });
    }
    data.schedules = clean;
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return res.status(400).json({ error: 'Bad day' });
    const blocks = cleanBlocks(extra || []);
    if (!blocks || !Array.isArray(done || []) || (done || []).length > 200 || !(done || []).every(okId)) return res.status(400).json({ error: 'Bad blocks' });
    if (blocks.length || (done || []).length) data.days[day] = { extra: blocks, done: done || [] };
    else delete data.days[day];
  }
  writeSchedule(req, data);
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
