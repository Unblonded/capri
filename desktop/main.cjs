// Capri desktop: a tray app that opens the Capri server running on another computer.
const { app, BrowserWindow, Tray, Menu, Notification, globalShortcut, ipcMain, nativeImage, shell, nativeTheme, screen } = require('electron');
const { autoUpdater } = require('electron-updater');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const desktopPin = require('./pin.cjs');

const QUICK_ADD_SHORTCUT = 'CommandOrControl+Shift+Space';
const IS_MAC = process.platform === 'darwin';
const DEFAULT_SERVER = 'https://capri.kalculator.lol';
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');
const ICON = path.join(__dirname, 'icons', 'icon.png');
const TRAY_ICON = path.join(__dirname, 'icons', process.platform === 'win32' ? 'tray.png' : 'trayTemplate.png');

// Chromium stops painting a window it thinks other windows cover. Pinned to the desktop, Capri sits
// under everything, so after a minimise it came back blank white. Always paint it.
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

let win = null;
let tray = null;
let quitting = false;
let updateReady = null; // version number once an update has downloaded
let raised = false; // pinned to the desktop, but brought up for now (tray, quick add) until it loses focus
let config = loadConfig();
if (!config.serverUrl) config.serverUrl = DEFAULT_SERVER;

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch { return {}; }
}

function saveConfig(changes) {
  config = { ...config, ...changes };
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// "capri.example.com" → https://capri.example.com; a bare IP or localhost → http://…:3300 (the server's default port).
function normalizeUrl(input) {
  let url = String(input || '').trim().replace(/\/+$/, '');
  if (!url) return null;
  const hasScheme = /^https?:\/\//i.test(url);
  const host = url.replace(/^https?:\/\//i, '').split(/[/:]/)[0];
  const local = /^(localhost|\d{1,3}(\.\d{1,3}){3})$/i.test(host);
  if (!hasScheme) url = `${local ? 'http' : 'https'}://${url}`;
  try {
    const u = new URL(url);
    if (local && !hasScheme && !/:\d+$/.test(u.host)) u.port = '3300';
    return u.origin;
  } catch {
    return null;
  }
}

// Any JSON reply from /api/status means a Capri server is there.
async function probe(url) {
  try {
    const res = await fetch(`${url}/api/status`, { signal: AbortSignal.timeout(5000) });
    const body = await res.json().catch(() => null);
    return Boolean(body && 'connected' in body);
  } catch {
    return false;
  }
}

function showSetup(error = '') {
  win.loadFile(path.join(__dirname, 'setup.html'), { query: { url: config.serverUrl || '', error } });
}

function openServer() {
  if (!config.serverUrl) return showSetup();
  win.loadURL(config.serverUrl);
  for (const [id, bw] of widgetWins) { const w = widgetById(id); if (w) bw.loadURL(widgetUrl(w)); }
}

// The page shows a slim Right now strip while the window is pinned to the desktop.
function markPinned() {
  if (!win || win.webContents.getURL().startsWith('file:')) return;
  win.webContents.executeJavaScript(`document.documentElement.classList.toggle('pinned', ${Boolean(config.pinned)}); dispatchEvent(new Event('capri-pinned'))`).catch(() => {});
}

// ---- desktop widgets ----
// Small cards on the desktop, as many as you like. Each shows one thing: what's on in your schedule right
// now, today's tasks, the focus timer, or upcoming deadlines. Drag one to move it, drag its corner to resize
// it, right-click it for its menu, tick tasks off on it. How each looks is set in Capri (sidebar → widget
// button), which keeps the look in the browser storage the widget windows share.
// Each sits on a layer:
//   desktop: behind every window. Windows: handed to the desktop like the pinned window. Mac: a
//            desktop-level window, which macOS won't let take clicks, so Move or resize… lifts it out
//            for a while and Done puts it back.
//   normal:  an ordinary window that other windows can cover.
//   top:     always on top of other windows.
// While you customise them in Capri, they all float on top (peek) so you can watch them change.
const WIDGET_KINDS = [['now', 'Right now'], ['today', 'Today’s tasks'], ['focus', 'Focus timer'], ['deadlines', 'Deadlines']];
const WIDGET_SIZES = { now: { width: 300, height: 132 }, focus: { width: 300, height: 132 }, today: { width: 300, height: 236 }, deadlines: { width: 300, height: 196 } };
const WIDGET_MIN = { width: 160, height: 72 };
const WIDGET_MAX = { width: 900, height: 800 };
const WIDGET_LAYERS = [['desktop', 'On the desktop'], ['normal', 'Normal window'], ['top', 'Always on top']];
const CORNERS = [['top-right', 'Top right'], ['top-left', 'Top left'], ['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left']];
const widgetWins = new Map(); // widget id → its window
const widgetMoving = new Set(); // ids lifted off the Mac desktop to be dragged
let widgetPeek = false;

// The list of widgets, from the old single-widget settings the first time.
function widgetList() {
  if (!Array.isArray(config.widgets)) {
    const kind = WIDGET_SIZES[config.widgetKind] ? config.widgetKind : 'now';
    saveConfig({
      widgets: [{
        id: 'w1', on: Boolean(config.widget), kind, corner: config.widgetCorner || 'top-right', pos: config.widgetPos || null,
        size: config.widgetSizes?.[kind] || null, layer: IS_MAC && config.widgetClickable !== false ? 'normal' : 'desktop',
      }],
    });
  }
  return config.widgets;
}
const widgetById = (id) => widgetList().find((w) => w.id === id);
function updateWidget(id, changes) {
  saveConfig({ widgets: widgetList().map((w) => (w.id === id ? { ...w, ...changes } : w)) });
  return widgetById(id);
}
const widgetSize = (w) => w.size || WIDGET_SIZES[w.kind] || WIDGET_SIZES.now;
const widgetLayer = (w) => (widgetPeek || widgetMoving.has(w.id) ? 'top' : w.layer || 'desktop');
const widgetUrl = (w) => `${config.serverUrl}/?widget=${w.kind}&id=${w.id}${widgetMoving.has(w.id) ? '&move=1' : ''}`;
const idOfSender = (sender) => [...widgetWins].find(([, bw]) => bw.webContents === sender)?.[0];

function widgetBounds(w) {
  const size = widgetSize(w);
  const pos = w.pos;
  if (pos && screen.getAllDisplays().some(({ workArea: a }) => pos.x >= a.x && pos.y >= a.y && pos.x + 40 <= a.x + a.width && pos.y + 40 <= a.y + a.height)) {
    return { ...pos, ...size };
  }
  const a = screen.getPrimaryDisplay().workArea;
  const corner = w.corner || 'top-right';
  // Widgets sharing a corner stack instead of sitting on top of each other.
  const before = widgetList().filter((o) => o.on && !o.pos && (o.corner || 'top-right') === corner).findIndex((o) => o.id === w.id);
  const offset = widgetList().filter((o) => o.on && !o.pos && (o.corner || 'top-right') === corner).slice(0, Math.max(0, before))
    .reduce((sum, o) => sum + widgetSize(o).height + 12, 0);
  const m = 20;
  return {
    x: corner.endsWith('left') ? a.x + m : a.x + a.width - size.width - m,
    y: corner.startsWith('top') ? a.y + m + offset : a.y + a.height - size.height - m - offset,
    ...size,
  };
}

// Moving one from here (a corner, a new size, a screen change) isn't the user dragging it somewhere.
const placedAt = new Map();
const moveSaves = new Map();
function setWidgetBounds(id, bounds) {
  const bw = widgetWins.get(id);
  if (!bw) return;
  placedAt.set(id, Date.now());
  bw.setBounds(bounds);
}
function placeAll() {
  for (const w of widgetList()) if (widgetWins.has(w.id) && !w.pos) setWidgetBounds(w.id, widgetBounds(w));
}

function createWidget(w) {
  if (widgetWins.has(w.id) || !config.serverUrl) return;
  const layer = widgetLayer(w);
  const bw = new BrowserWindow({
    ...widgetBounds(w), show: false, frame: false, transparent: true, hasShadow: false, resizable: false,
    minimizable: false, maximizable: false, fullscreenable: false, skipTaskbar: true, title: 'Capri widget',
    ...(IS_MAC ? { acceptFirstMouse: true } : {}), // a click ticks a task off without first focusing
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, backgroundThrottling: false },
  });
  widgetWins.set(w.id, bw);
  if (IS_MAC) applyLayer(w.id);
  else if (layer === 'top') bw.setAlwaysOnTop(true, 'floating');
  bw.loadURL(widgetUrl(w));
  bw.once('ready-to-show', () => {
    if (widgetMoving.has(w.id)) { bw.show(); bw.focus(); return; }
    bw.showInactive();
    if (!IS_MAC && layer === 'desktop' && !desktopPin.pin(bw)) bw.setAlwaysOnTop(false);
  });
  bw.on('focus', () => { if (!IS_MAC && widgetLayer(w) === 'desktop') desktopPin.sendToBack(bw); });
  bw.on('moved', () => {
    if (Date.now() - (placedAt.get(w.id) || 0) < 600) return;
    clearTimeout(moveSaves.get(w.id)); // saved once it settles
    moveSaves.set(w.id, setTimeout(() => {
      if (bw.isDestroyed()) return;
      const [x, y] = bw.getPosition();
      updateWidget(w.id, { pos: { x, y } });
      placeAll(); // the ones it left in a corner close the gap
      widgetChanged();
    }, 250));
  });
  bw.on('minimize', () => bw.restore());
  // Right-clicking where the card drags gives Windows' own window menu; show the widget's instead.
  bw.on('system-context-menu', (e) => { e.preventDefault(); popupWidgetMenu(w.id); });
  bw.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  bw.webContents.on('will-navigate', (e, url) => { if (!isServer(url)) e.preventDefault(); });
  bw.on('closed', () => { if (widgetWins.get(w.id) === bw) widgetWins.delete(w.id); });
}
function rebuildWidget(id) {
  widgetWins.get(id)?.destroy();
  widgetWins.delete(id);
  const w = widgetById(id);
  if (w?.on) createWidget(w);
}

// What Capri's widget settings show. Capri is told whenever something changes from anywhere.
function widgetState() {
  return {
    widgets: widgetList().map((w) => ({
      ...w, size: widgetSize(w), defaultSize: WIDGET_SIZES[w.kind], customSize: Boolean(w.size),
      corner: w.pos ? null : w.corner || 'top-right', layer: w.layer || 'desktop', moving: widgetMoving.has(w.id),
    })),
    kinds: WIDGET_KINDS, layers: WIDGET_LAYERS, mac: IS_MAC, peek: widgetPeek,
    desktopClickable: true, // Mac desktop widgets can be dragged and resized in place (no Move mode)
  };
}
function widgetChanged() {
  tray?.setContextMenu(buildTrayMenu());
  if (win && !win.isDestroyed()) win.webContents.send('capri:widget-changed', widgetState());
}

function setWidgetOn(id, on) {
  updateWidget(id, { on });
  widgetMoving.delete(id);
  rebuildWidget(id);
  placeAll();
  widgetChanged();
}
function setWidgetKind(id, kind) {
  if (!WIDGET_SIZES[kind]) return;
  updateWidget(id, { kind, size: null }); // each kind has its own size
  rebuildWidget(id);
  placeAll();
  widgetChanged();
}
// Puts an open widget on its layer without reloading it.
// On a Mac, "on the desktop" is the level just under ordinary windows: every app's windows cover it, but it
// sits above the desktop's icons, so it can still be clicked, dragged and resized. (A desktop-type window
// can't be clicked at all, can't switch layers without being made again, and often vanished with Spaces.)
// skipTransformProcessType stops the Dock icon and menu bar flickering each time a layer changes.
function applyLayer(id) {
  const w = widgetById(id);
  const bw = widgetWins.get(id);
  if (!w || !bw) return;
  const layer = widgetLayer(w);
  if (IS_MAC) {
    bw.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: layer === 'top', skipTransformProcessType: true });
    if (layer === 'desktop') bw.setAlwaysOnTop(true, 'normal', -1);
    else bw.setAlwaysOnTop(layer === 'top', 'floating');
    return;
  }
  if (layer === 'desktop') { bw.setAlwaysOnTop(false); desktopPin.pin(bw); } else desktopPin.unpin(bw);
  bw.setAlwaysOnTop(layer === 'top', 'floating');
}
function setWidgetLayer(id, layer) {
  if (!WIDGET_LAYERS.some(([l]) => l === layer)) return;
  updateWidget(id, { layer });
  widgetMoving.delete(id);
  applyLayer(id);
  widgetChanged();
}
function placeWidget(id, corner) {
  if (!CORNERS.some(([c]) => c === corner)) return;
  updateWidget(id, { corner, pos: null });
  placeAll();
  widgetChanged();
}
function moveWidget(id) {
  widgetMoving.add(id);
  rebuildWidget(id);
  widgetChanged();
}
const sizeSaves = new Map();
function resizeWidget(id, { width, height }, { now = false } = {}) {
  const w = widgetById(id);
  if (!w || !Number.isFinite(width) || !Number.isFinite(height)) return;
  const size = {
    width: Math.round(Math.min(WIDGET_MAX.width, Math.max(WIDGET_MIN.width, width))),
    height: Math.round(Math.min(WIDGET_MAX.height, Math.max(WIDGET_MIN.height, height))),
  };
  const save = () => { updateWidget(id, { size }); widgetChanged(); };
  clearTimeout(sizeSaves.get(id)); // a drag sends many sizes; keep the last
  if (now) { // picked in Capri: a widget in a corner stays tucked into it
    save();
    const bw = widgetWins.get(id);
    if (bw) { const [x, y] = bw.getPosition(); setWidgetBounds(id, w.pos ? { x, y, ...size } : widgetBounds(widgetById(id))); }
    placeAll();
    return;
  }
  const bw = widgetWins.get(id);
  if (bw) { const [x, y] = bw.getPosition(); setWidgetBounds(id, { x, y, ...size }); }
  sizeSaves.set(id, setTimeout(save, 400));
}
function resetWidgetSize(id) {
  const w = updateWidget(id, { size: null });
  const bw = widgetWins.get(id);
  if (bw) { const [x, y] = bw.getPosition(); setWidgetBounds(id, w.pos ? { x, y, ...widgetSize(w) } : widgetBounds(w)); }
  placeAll();
  widgetChanged();
}
function addWidget(kind = 'today') {
  const id = `w${crypto.randomBytes(4).toString('hex')}`;
  saveConfig({ widgets: [...widgetList(), { id, on: true, kind: WIDGET_SIZES[kind] ? kind : 'today', corner: 'top-right', pos: null, size: null, layer: 'desktop' }] });
  createWidget(widgetById(id));
  widgetChanged();
  return id;
}
function removeWidget(id) {
  widgetWins.get(id)?.destroy();
  widgetWins.delete(id);
  widgetMoving.delete(id);
  saveConfig({ widgets: widgetList().filter((w) => w.id !== id) });
  placeAll();
  widgetChanged();
}
function setWidgetPeek(on) {
  if (widgetPeek === on) return;
  widgetPeek = on;
  for (const w of widgetList()) if (widgetWins.has(w.id)) applyLayer(w.id);
}
function openWidgetStudio(id) {
  showWindow();
  win.webContents.send('capri:open-widget-studio', id || null);
}

// Each widget's settings, in the tray / menu-bar menu and on the widget's right-click menu.
function widgetMenuItems(id) {
  const w = widgetById(id);
  if (!w) return [];
  return [
    { label: 'Shows', submenu: WIDGET_KINDS.map(([k, label]) => ({ label, type: 'radio', checked: w.kind === k, click: () => setWidgetKind(id, k) })) },
    {
      label: 'Position',
      submenu: [
        ...CORNERS.map(([c, label]) => ({ label, type: 'radio', checked: (w.corner || 'top-right') === c && !w.pos, click: () => placeWidget(id, c) })),
      ],
    },
    { label: 'Layer', submenu: WIDGET_LAYERS.map(([l, label]) => ({ label, type: 'radio', checked: (w.layer || 'desktop') === l, click: () => setWidgetLayer(id, l) })) },
    { label: 'Reset size', enabled: Boolean(w.size), click: () => resetWidgetSize(id) },
  ];
}
function popupWidgetMenu(id) {
  const bw = widgetWins.get(id);
  if (!bw) return;
  Menu.buildFromTemplate([
    { label: 'Customise…', click: () => openWidgetStudio(id) },
    { label: 'Open Capri', click: showWindow },
    { label: 'Refresh', click: () => bw.webContents.reload() },
    { type: 'separator' },
    ...widgetMenuItems(id),
    { type: 'separator' },
    { label: 'Add another widget', click: () => addWidget(widgetById(id)?.kind === 'today' ? 'now' : 'today') },
    { label: 'Hide this widget', click: () => setWidgetOn(id, false) },
  ]).popup({ window: bw, callback: () => setTimeout(() => tray?.setContextMenu(buildTrayMenu()), 100) }); // ticks match on the Mac menu bar
}
// Its own title, or its kind, numbered when there are two of a kind ("Today’s tasks 2").
function widgetLabel(w, list = widgetList()) {
  if (w.title) return w.title;
  const same = list.filter((o) => o.kind === w.kind && !o.title);
  const name = WIDGET_KINDS.find(([k]) => k === w.kind)?.[1] || w.kind;
  return same.length > 1 ? `${name} ${same.indexOf(w) + 1}` : name;
}
function widgetTrayItems() {
  const list = widgetList();
  return [{
    label: 'Desktop widgets', enabled: Boolean(config.serverUrl),
    submenu: [
      ...list.map((w) => ({
        label: widgetLabel(w, list),
        submenu: [{ label: 'Show', type: 'checkbox', checked: Boolean(w.on), click: (item) => setWidgetOn(w.id, item.checked) }, { type: 'separator' }, ...widgetMenuItems(w.id),
          { type: 'separator' }, { label: 'Remove', click: () => removeWidget(w.id) }],
      })),
      ...(list.length ? [{ type: 'separator' }] : []),
      { label: 'Add a widget', click: () => addWidget(list.some((w) => w.kind === 'today') ? 'now' : 'today') },
      { label: 'Customise widgets…', click: () => openWidgetStudio() },
    ],
  }];
}

// From the widget windows
ipcMain.on('capri:widget-menu', (e) => { const id = idOfSender(e.sender); if (id) popupWidgetMenu(id); });
ipcMain.on('capri:widget-resize', (e, size) => { const id = idOfSender(e.sender); if (id) resizeWidget(id, size || {}); });
ipcMain.on('capri:widget-done', (e) => {
  const id = idOfSender(e.sender);
  if (!id || !widgetMoving.has(id)) return;
  const [x, y] = widgetWins.get(id).getPosition();
  updateWidget(id, { pos: { x, y } });
  widgetMoving.delete(id);
  rebuildWidget(id);
  widgetChanged();
});
// From Capri's widget settings, in the main window only
const fromMain = (e) => e.sender === win?.webContents;
ipcMain.handle('capri:widget-get', () => widgetState());
ipcMain.handle('capri:widget-update', (e, id, changes = {}) => {
  if (!fromMain(e) || !widgetById(id)) return widgetState();
  if ('on' in changes) setWidgetOn(id, Boolean(changes.on));
  if (changes.kind) setWidgetKind(id, changes.kind);
  if (changes.layer) setWidgetLayer(id, changes.layer);
  if (changes.corner) placeWidget(id, changes.corner);
  if (changes.size === 'reset') resetWidgetSize(id);
  else if (changes.size) resizeWidget(id, changes.size, { now: true });
  if (changes.move && IS_MAC && widgetById(id).on) moveWidget(id);
  if (typeof changes.title === 'string') { updateWidget(id, { title: changes.title.trim().slice(0, 40) }); widgetChanged(); }
  if (changes.reload) widgetWins.get(id)?.webContents.reload();
  return widgetState();
});
ipcMain.handle('capri:widget-add', (e, kind) => { if (fromMain(e)) addWidget(kind); return widgetState(); });
ipcMain.handle('capri:widget-remove', (e, id) => { if (fromMain(e)) removeWidget(id); return widgetState(); });
ipcMain.handle('capri:widget-peek', (e, on) => { if (fromMain(e)) setWidgetPeek(Boolean(on)); return widgetState(); });
// 0.5.9's single-widget calls, for a page cached from before: they act on the first widget.
ipcMain.handle('capri:widget-set', (e, changes = {}) => {
  const first = widgetList()[0] || { id: addWidget('now') };
  if (fromMain(e)) {
    if ('on' in changes) setWidgetOn(first.id, Boolean(changes.on));
    if (changes.kind) setWidgetKind(first.id, changes.kind);
    if (changes.corner) placeWidget(first.id, changes.corner);
    if (changes.size === 'reset') resetWidgetSize(first.id);
    else if (changes.size) resizeWidget(first.id, changes.size, { now: true });
  }
  return widgetState();
});
ipcMain.on('capri:open', () => showWindow());

function createWindow() {
  const bounds = config.bounds || { width: 1200, height: 800 };
  win = new BrowserWindow({
    ...bounds,
    minWidth: 380,
    minHeight: 480,
    show: false,
    title: 'Capri',
    icon: ICON,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b0d18' : '#eef0f7',
    alwaysOnTop: Boolean(config.alwaysOnTop),
    autoHideMenuBar: true,
    // Hide the native title bar. Windows still draws its min/max/close buttons over the page;
    // macOS keeps its traffic lights, set into the same strip.
    titleBarStyle: 'hidden',
    ...(IS_MAC
      ? { trafficLightPosition: { x: 14, y: 11 } }
      : { titleBarOverlay: { color: '#00000000', symbolColor: '#8a8fa8', height: 34 } }),
    // Hidden or minimised, Chromium idles the page; only the pinned widget keeps painting (see setPinned).
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, backgroundThrottling: !config.pinned },
  });
  win.setMenuBarVisibility(false);

  // Pinned to the desktop it shows at startup too, like a widget.
  if (!startedHidden() || config.pinned) win.once('ready-to-show', () => win.show());
  if (config.pinned) win.once('show', () => setPinned(true));

  // Leave room for the window buttons and make the top strip draggable.
  win.webContents.on('did-finish-load', () => {
    markPinned();
    win.webContents.insertCSS(`
      body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; height: 34px; z-index: 1000; -webkit-app-region: drag; }
      .app { padding-top: 38px !important; }
      .modal { padding-top: 15vh; }
      button, a, input, select, textarea { -webkit-app-region: no-drag; }
    `);
  });

  win.webContents.on('did-fail-load', (e, code, desc, url, isMainFrame) => {
    // -3 is an aborted navigation (e.g. a redirect), not a real failure.
    if (isMainFrame && code !== -3 && !url.startsWith('file:')) showSetup(`Couldn't reach ${config.serverUrl} (${desc}). Is the server running?`);
  });

  // Todoist links and the like open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => { openOutside(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('file:') || isServer(url)) return;
    e.preventDefault();
    openOutside(url);
  });

  // F5 / Ctrl+R reload, Ctrl+Shift+I devtools, since there's no menu bar.
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    const ctrl = input.control || input.meta;
    if (input.key === 'F5' || (ctrl && input.key.toLowerCase() === 'r')) { e.preventDefault(); openServer(); }
    if (ctrl && input.shift && input.key.toLowerCase() === 'i') win.webContents.toggleDevTools();
  });

  // Pinned: clicking it keeps it on the desktop layer instead of jumping above other windows,
  // and "show desktop" (Win+D) doesn't minimise it away.
  win.on('focus', () => { if (config.pinned && !raised) desktopPin.sendToBack(win); });
  win.on('blur', () => { if (raised) { raised = false; if (config.pinned) desktopPin.sendToBack(win); } });
  win.on('minimize', () => { if (config.pinned) win.restore(); });
  win.on('restore', repaint);
  // Widgets float on top only while Capri's widget settings are open and in view.
  win.on('hide', () => setWidgetPeek(false));
  win.webContents.on('did-start-loading', () => setWidgetPeek(false));

  // Closing hides to the tray so Capri stays running.
  win.on('close', (e) => {
    if (quitting) return;
    e.preventDefault();
    win.hide();
  });

  let saveTimer;
  const rememberBounds = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { if (!win.isMaximized() && !win.isMinimized()) saveConfig({ bounds: win.getBounds() }); }, 500);
  };
  win.on('resize', rememberBounds);
  win.on('move', rememberBounds);

  openServer();
}

// Coming back from minimised, make sure the page is drawn again rather than left white: ask for a
// fresh frame, and nudge the size a pixel and back, which makes Windows hand over a new surface.
function repaint() {
  setTimeout(() => {
    if (!win || win.isDestroyed() || win.isMinimized() || win.isMaximized()) return win?.webContents.invalidate();
    const [w, h] = win.getSize();
    win.setSize(w, h + 1);
    win.setSize(w, h);
    win.webContents.invalidate();
  }, 50);
}

// Launched at login: stay in the tray (Windows passes --hidden; macOS tells us it opened it).
function startedHidden() {
  return process.argv.includes('--hidden') || (IS_MAC && app.getLoginItemSettings().wasOpenedAtLogin);
}

const setOpenAtLogin = (openAtLogin) => app.setLoginItemSettings({ openAtLogin, args: ['--hidden'] });

// Only ordinary web and mail links leave the app: anything else (file:, other apps' link types) could
// open or run something on this computer.
function openOutside(url) {
  try {
    if (['http:', 'https:', 'mailto:'].includes(new URL(url).protocol)) shell.openExternal(url);
  } catch { /* not a URL */ }
}
// The same server exactly (scheme, host and port), not just an address that starts the same way.
function isServer(url) {
  try { return Boolean(config.serverUrl) && new URL(url).origin === new URL(config.serverUrl).origin; } catch { return false; }
}

function showWindow() {
  if (config.pinned) raised = true;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function quickAdd() {
  showWindow();
  // The web app opens quick add when its sidebar button is clicked.
  win.webContents.executeJavaScript(`document.querySelector('#sidebar-add')?.click()`).catch(() => {});
}

function setPinned(on) {
  if (on && !desktopPin.pin(win)) {
    new Notification({ title: 'Capri', body: 'Couldn’t pin Capri to the desktop on this PC.' }).show();
    on = false;
  }
  if (!on) desktopPin.unpin(win);
  win.webContents.setBackgroundThrottling(!on);
  win.setSkipTaskbar(on);
  win.setMinimizable(!on); // a desktop widget has nothing to minimise to
  if (on) win.setAlwaysOnTop(false);
  else win.setAlwaysOnTop(Boolean(config.alwaysOnTop));
  saveConfig({ pinned: on });
  markPinned();
}

// Drops cached pages, scripts and styles so the latest from the server loads. Cookies stay,
// so you remain signed in.
async function clearCache() {
  const ses = win.webContents.session;
  await ses.clearCache();
  await ses.clearStorageData({ storages: ['cachestorage', 'serviceworkers', 'shadercache'] });
  showWindow();
  openServer();
  new Notification({ title: 'Capri', body: 'Cache cleared. Loaded the latest version.' }).show();
}

function buildTrayMenu() {
  const login = app.getLoginItemSettings();
  return Menu.buildFromTemplate([
    { label: 'Open Capri', click: showWindow },
    { label: 'Quick add task', accelerator: QUICK_ADD_SHORTCUT, click: quickAdd },
    { type: 'separator' },
    { label: 'Show icon on the taskbar…', visible: process.platform === 'win32', click: showTaskbarSettings },
    {
      label: 'Pin to desktop', type: 'checkbox', checked: Boolean(config.pinned),
      visible: process.platform === 'win32', enabled: desktopPin.available(),
      click: (item) => setPinned(item.checked),
    },
    ...widgetTrayItems(),
    {
      label: 'Always on top', type: 'checkbox', checked: Boolean(config.alwaysOnTop), enabled: !config.pinned,
      click: (item) => { win.setAlwaysOnTop(item.checked); saveConfig({ alwaysOnTop: item.checked }); },
    },
    {
      label: IS_MAC ? 'Open at login' : 'Start with Windows', type: 'checkbox', checked: login.openAtLogin,
      click: (item) => setOpenAtLogin(item.checked),
    },
    { label: 'Change server…', click: () => { showWindow(); showSetup(); } },
    { label: 'Reload', click: openServer },
    { label: 'Clear cache and reload', click: clearCache },
    { type: 'separator' },
    updateReady
      ? { label: `Restart to update to ${updateReady}`, click: () => { quitting = true; autoUpdater.quitAndInstall(); } }
      : { label: `Check for updates (v${app.getVersion()})`, enabled: canSelfUpdate(), click: () => checkForUpdates(true) },
    { type: 'separator' },
    { label: 'Quit Capri', click: () => { quitting = true; app.quit(); } },
  ]);
}

// Windows remembers whether a tray icon shows on the taskbar or hides behind the ^ arrow by the icon's
// GUID. Without one, every update can reset your choice. Windows ties an unsigned app's GUID to its path,
// so the GUID is made from the install path: stable across updates, never reused somewhere else.
// The portable app runs from a fresh temporary folder each time, so it goes without.
function trayGuid() {
  if (process.platform !== 'win32' || !app.isPackaged || process.env.PORTABLE_EXECUTABLE_DIR) return undefined;
  const h = crypto.createHash('sha1').update(`capri-tray:${process.execPath.toLowerCase()}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

// Apps can't put their own icon on the taskbar; this opens the setting and says which switch to flip.
function showTaskbarSettings() {
  shell.openExternal('ms-settings:taskbar').catch(() => {});
  new Notification({ title: 'Keep Capri on the taskbar', body: 'Open “Other system tray icons” and turn Capri on. Windows remembers it from then on, updates included.' }).show();
}

function createTray() {
  const image = nativeImage.createFromPath(TRAY_ICON);
  const guid = trayGuid();
  try { tray = guid ? new Tray(image, guid) : new Tray(image); } catch { tray = new Tray(image); }
  tray.setToolTip('Capri');
  tray.setContextMenu(buildTrayMenu());
  // Rebuild so the checkboxes reflect the current state each time.
  tray.on('right-click', () => tray.setContextMenu(buildTrayMenu()));
  tray.on('click', () => (win.isVisible() && win.isFocused() ? win.hide() : showWindow()));
}

// ---- self-updates ----
// The Capri server builds this app and hosts it at <server>/updates, so updates come from wherever
// the app points. Only the installed version can update itself; the portable exe can't.

const canSelfUpdate = () => app.isPackaged && process.platform === 'win32' && !process.env.PORTABLE_EXECUTABLE_DIR;

function checkForUpdates(manual = false) {
  if (!canSelfUpdate() || !config.serverUrl) return;
  autoUpdater.setFeedURL({ provider: 'generic', url: `${config.serverUrl}/updates` });
  autoUpdater.checkForUpdates()
    .then((r) => {
      if (manual && !r?.isUpdateAvailable) new Notification({ title: 'Capri', body: `You're on the latest version (${app.getVersion()}).` }).show();
    })
    .catch((err) => { if (manual) new Notification({ title: 'Capri', body: `Couldn't check for updates: ${err.message}` }).show(); });
}

function setupUpdates() {
  if (!canSelfUpdate()) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', (info) => {
    updateReady = info.version;
    tray.setContextMenu(buildTrayMenu());
    const note = new Notification({ title: 'Capri update ready', body: `Version ${info.version} installs next time Capri restarts. Click to restart now.` });
    note.on('click', () => { quitting = true; autoUpdater.quitAndInstall(); });
    note.show();
  });
  autoUpdater.on('error', (err) => console.warn('Update check failed:', err.message));
  checkForUpdates();
  setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
}

// Reminders from the page (schedule blocks, tasks, deadlines) as native Windows / Mac notifications.
// Clicking one brings Capri forward on the page it's about. Shown ones are held so Windows keeps the click.
const shownNotes = new Set();
ipcMain.on('capri:notify', (e, n) => {
  if (!Notification.isSupported() || !n || typeof n.title !== 'string') return;
  const note = new Notification({ title: n.title.slice(0, 120), body: String(n.body || '').slice(0, 200), silent: false });
  shownNotes.add(note);
  const forget = () => shownNotes.delete(note);
  note.on('click', () => {
    forget();
    showWindow();
    if (typeof n.url === 'string' && /^\/#\/[\w/-]*$/.test(n.url)) win.webContents.executeJavaScript(`location.hash = ${JSON.stringify(n.url.slice(1))}`).catch(() => {});
  });
  note.on('close', forget);
  setTimeout(forget, 10 * 60 * 1000);
  note.show();
});

ipcMain.handle('capri:set-server', async (e, input) => {
  const url = normalizeUrl(input);
  if (!url) return { ok: false, error: 'That doesn’t look like an address. Try something like 192.168.1.50:3300' };
  if (!(await probe(url))) return { ok: false, error: `No Capri server answered at ${url}. Check it’s running and on the same network.` };
  saveConfig({ serverUrl: url });
  openServer();
  return { ok: true };
});

// One Capri at a time: launching it again just brings the window forward.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => win && showWindow());
  app.setAppUserModelId('com.unblonded.capri'); // needed for Windows notifications
  app.whenReady().then(() => {
    createWindow();
    createTray();
    for (const w of widgetList()) if (w.on) createWidget(w);
    // Widgets keep to their corners when screens are added, removed or resized.
    screen.on('display-metrics-changed', placeAll);
    screen.on('display-removed', () => { for (const w of widgetList()) if (widgetWins.has(w.id)) setWidgetBounds(w.id, widgetBounds(w)); });
    globalShortcut.register(QUICK_ADD_SHORTCUT, quickAdd);
    setupUpdates();
    // First launch: start with Windows unless the user turns it off from the tray.
    if (!config.loginItemSet) {
      setOpenAtLogin(true);
      saveConfig({ loginItemSet: true });
    }
  });
  app.on('before-quit', () => { quitting = true; });
  app.on('will-quit', () => globalShortcut.unregisterAll());
  app.on('activate', () => win && showWindow());
}
