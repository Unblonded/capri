// Capri desktop: a tray app that opens the Capri server running on another computer.
const { app, BrowserWindow, Tray, Menu, Notification, globalShortcut, ipcMain, nativeImage, shell, nativeTheme, screen } = require('electron');
const { autoUpdater } = require('electron-updater');
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
  if (widget) widget.loadURL(widgetUrl());
}

// The page shows a slim Right now strip while the window is pinned to the desktop.
function markPinned() {
  if (!win || win.webContents.getURL().startsWith('file:')) return;
  win.webContents.executeJavaScript(`document.documentElement.classList.toggle('pinned', ${Boolean(config.pinned)}); dispatchEvent(new Event('capri-pinned'))`).catch(() => {});
}

// ---- desktop widget ----
// A small card on the desktop, behind every window. It shows one thing, picked from the menu: what's on
// in your schedule right now, today's tasks, the focus timer, or upcoming deadlines. Windows: handed to
// the desktop like the pinned window, and draggable. Mac: a desktop-level window, which macOS won't let
// take clicks, so Move widget… lifts it out to be dragged and Done puts it back.
let widget = null;
let widgetMoving = false;
const WIDGET_KINDS = [['now', 'Right now'], ['today', 'Today’s tasks'], ['focus', 'Focus timer'], ['deadlines', 'Deadlines']];
const WIDGET_SIZES = { now: { width: 300, height: 132 }, focus: { width: 300, height: 132 }, today: { width: 300, height: 236 }, deadlines: { width: 300, height: 196 } };
const widgetKind = () => (WIDGET_SIZES[config.widgetKind] ? config.widgetKind : 'now');
const widgetUrl = () => `${config.serverUrl}/?widget=${widgetKind()}${widgetMoving ? '&move=1' : ''}`;
function widgetBounds() {
  const size = WIDGET_SIZES[widgetKind()];
  const pos = config.widgetPos;
  if (pos && screen.getAllDisplays().some(({ workArea: a }) => pos.x >= a.x && pos.y >= a.y && pos.x + 40 <= a.x + a.width && pos.y + 40 <= a.y + a.height)) {
    return { ...pos, ...size };
  }
  const a = screen.getPrimaryDisplay().workArea;
  const corner = config.widgetCorner || 'top-right';
  const m = 20;
  return {
    x: corner.endsWith('left') ? a.x + m : a.x + a.width - size.width - m,
    y: corner.startsWith('top') ? a.y + m : a.y + a.height - size.height - m,
    ...size,
  };
}
function createWidget() {
  if (widget || !config.serverUrl) return;
  const onDesktop = IS_MAC && !widgetMoving; // while moving on a Mac it's an ordinary window you can drag
  widget = new BrowserWindow({
    ...widgetBounds(), show: false, frame: false, transparent: true, hasShadow: false, resizable: false,
    minimizable: false, maximizable: false, fullscreenable: false, skipTaskbar: true, title: 'Capri widget',
    ...(onDesktop ? { type: 'desktop', focusable: false } : {}),
    ...(widgetMoving ? { alwaysOnTop: true } : {}),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, backgroundThrottling: false },
  });
  if (IS_MAC) widget.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  widget.loadURL(widgetUrl());
  widget.once('ready-to-show', () => {
    if (widgetMoving) { widget.show(); widget.focus(); return; }
    widget.showInactive();
    if (!IS_MAC && !desktopPin.pin(widget)) widget.setAlwaysOnTop(false);
  });
  widget.on('focus', () => { if (!IS_MAC && !widgetMoving) desktopPin.sendToBack(widget); });
  widget.on('moved', () => { const [x, y] = widget.getPosition(); saveConfig({ widgetPos: { x, y } }); });
  widget.on('minimize', () => widget.restore());
  widget.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  widget.webContents.on('will-navigate', (e, url) => { if (!isServer(url)) e.preventDefault(); });
  widget.on('closed', () => { widget = null; });
}
function rebuildWidget() {
  if (widget) widget.destroy();
  widget = null;
  if (config.widget) createWidget();
}
function setWidget(on) {
  saveConfig({ widget: on });
  widgetMoving = false;
  rebuildWidget();
}
function setWidgetKind(kind) {
  saveConfig({ widgetKind: kind });
  rebuildWidget(); // each kind has its own size
}
function placeWidget(corner) {
  saveConfig({ widgetCorner: corner, widgetPos: null });
  if (widget) widget.setBounds(widgetBounds());
}
function moveWidget() {
  widgetMoving = true;
  rebuildWidget();
}
ipcMain.on('capri:widget-done', () => {
  if (!widgetMoving) return;
  if (widget) { const [x, y] = widget.getPosition(); saveConfig({ widgetPos: { x, y } }); }
  widgetMoving = false;
  rebuildWidget();
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
    {
      label: 'Pin to desktop', type: 'checkbox', checked: Boolean(config.pinned),
      visible: process.platform === 'win32', enabled: desktopPin.available(),
      click: (item) => setPinned(item.checked),
    },
    { label: 'Desktop widget', type: 'checkbox', checked: Boolean(config.widget), enabled: Boolean(config.serverUrl), click: (item) => setWidget(item.checked) },
    {
      label: 'Widget shows', enabled: Boolean(config.widget),
      submenu: WIDGET_KINDS.map(([id, label]) => ({ label, type: 'radio', checked: widgetKind() === id, click: () => setWidgetKind(id) })),
    },
    {
      label: 'Widget position', enabled: Boolean(config.widget),
      submenu: [
        ...[['top-right', 'Top right'], ['top-left', 'Top left'], ['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left']].map(([id, label]) => ({
          label, type: 'radio', checked: (config.widgetCorner || 'top-right') === id && !config.widgetPos, click: () => placeWidget(id),
        })),
        ...(IS_MAC ? [{ type: 'separator' }, { label: 'Move widget…', click: moveWidget }] : []),
      ],
    },
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

function createTray() {
  tray = new Tray(nativeImage.createFromPath(TRAY_ICON));
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
    if (config.widget) createWidget();
    // The widget keeps to its corner when screens are added, removed or resized.
    screen.on('display-metrics-changed', () => widget?.setBounds(widgetBounds()));
    screen.on('display-removed', () => widget?.setBounds(widgetBounds()));
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
