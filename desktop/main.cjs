// Capri desktop: a tray app that opens the Capri server running on another computer.
const { app, BrowserWindow, Tray, Menu, Notification, globalShortcut, ipcMain, nativeImage, shell, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('node:fs');
const path = require('node:path');
const desktopPin = require('./pin.cjs');

const QUICK_ADD_SHORTCUT = 'CommandOrControl+Shift+Space';
const DEFAULT_SERVER = 'https://capri.kalculator.lol';
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');
const ICON = path.join(__dirname, 'icons', 'icon.png');
const TRAY_ICON = path.join(__dirname, 'icons', process.platform === 'win32' ? 'tray.png' : 'trayTemplate.png');

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
}

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
    // Hide the native title bar; Windows still draws its min/max/close buttons over the page.
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#8a8fa8', height: 34 },
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true },
  });
  win.setMenuBarVisibility(false);

  // Pinned to the desktop it shows at startup too, like a widget.
  if (!process.argv.includes('--hidden') || config.pinned) win.once('ready-to-show', () => win.show());
  if (config.pinned) win.once('show', () => setPinned(true));

  // Leave room for the window buttons and make the top strip draggable.
  win.webContents.on('did-finish-load', () => {
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
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('file:') || (config.serverUrl && url.startsWith(config.serverUrl))) return;
    e.preventDefault();
    shell.openExternal(url);
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
  win.setSkipTaskbar(on);
  if (on) win.setAlwaysOnTop(false);
  else win.setAlwaysOnTop(Boolean(config.alwaysOnTop));
  saveConfig({ pinned: on });
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
    {
      label: 'Always on top', type: 'checkbox', checked: Boolean(config.alwaysOnTop), enabled: !config.pinned,
      click: (item) => { win.setAlwaysOnTop(item.checked); saveConfig({ alwaysOnTop: item.checked }); },
    },
    {
      label: 'Start with Windows', type: 'checkbox', checked: login.openAtLogin,
      click: (item) => { app.setLoginItemSettings({ openAtLogin: item.checked, args: ['--hidden'] }); },
    },
    { label: 'Change server…', click: () => { showWindow(); showSetup(); } },
    { label: 'Reload', click: openServer },
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
    globalShortcut.register(QUICK_ADD_SHORTCUT, quickAdd);
    setupUpdates();
    // First launch: start with Windows unless the user turns it off from the tray.
    if (!config.loginItemSet) {
      app.setLoginItemSettings({ openAtLogin: true, args: ['--hidden'] });
      saveConfig({ loginItemSet: true });
    }
  });
  app.on('before-quit', () => { quitting = true; });
  app.on('will-quit', () => globalShortcut.unregisterAll());
  app.on('activate', () => win && showWindow());
}
