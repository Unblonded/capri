// Capri's offline cache. The app itself (page, script, styles, icons, fonts) is served from the cache
// straight away and refreshed in the background, so the home-screen app opens instantly. Your tasks
// come from the network when it answers quickly, otherwise from the last copy saved on this device.
const SHELL = 'capri-shell-v1';
const FONTS = 'capri-fonts-v1';
const DATA = 'capri-data-v1';
const SHELL_FILES = ['/', '/app.js', '/styles.css', '/manifest.webmanifest', '/icons/apple-touch-icon.png', '/icons/icon-192.png'];
// Read-only calls whose last answer is worth keeping for offline use.
const DATA_PATHS = ['/api/status', '/api/bootstrap', '/api/drawings'];
const NETWORK_WAIT = 3500;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  const keep = [SHELL, FONTS, DATA];
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('capri-') && !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return e.respondWith(cacheFirst(req));
  }
  if (url.origin !== location.origin) return;
  if (DATA_PATHS.includes(url.pathname)) return e.respondWith(networkFirst(req));
  // Everything else under /api, sign-in and the desktop updater always goes to the server.
  if (/^\/(api|auth|updates)(\/|$)/.test(url.pathname)) return;
  // Every page route is the same single page.
  const key = req.mode === 'navigate' ? '/' : url.pathname;
  e.respondWith(staleWhileRevalidate(e, key));
});

async function cacheFirst(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(e, key) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(key);
  const fresh = fetch(key, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) return res;
    await cache.put(key, res.clone());
    const before = hit?.headers.get('etag');
    const after = res.headers.get('etag');
    if (hit && before && after && before !== after) notifyUpdated();
    return res;
  });
  if (!hit) return fresh;
  e.waitUntil(fresh.catch(() => {}));
  return hit;
}

async function networkFirst(req) {
  const cache = await caches.open(DATA);
  const network = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    // Signed out or token rejected: don't keep serving the old account's tasks.
    else if (res.status === 401) caches.delete(DATA);
    return res;
  });
  const slow = new Promise((resolve) => setTimeout(resolve, NETWORK_WAIT));
  try {
    const first = await Promise.race([network, slow]);
    if (first) return first;
    return (await cache.match(req)) || (await network);
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    return new Response(JSON.stringify({ error: "You're offline" }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

// A new version of Capri finished downloading: tell open windows (once per update).
let notifyTimer = null;
function notifyUpdated() {
  clearTimeout(notifyTimer);
  notifyTimer = setTimeout(async () => {
    for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage('capri-updated');
  }, 300);
}
