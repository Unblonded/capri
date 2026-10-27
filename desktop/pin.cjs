// "Pin to desktop" on Windows: hands the window to the desktop (Progman) as its owner, so it sits
// just above the wallpaper and icons, under every other window, like a desktop widget. Electron has
// no API for this, so it calls user32 directly through koffi.
let user32 = null;

function load() {
  if (user32 || process.platform !== 'win32') return user32;
  const koffi = require('koffi');
  const lib = koffi.load('user32.dll');
  user32 = {
    FindWindowW: lib.func('intptr_t __stdcall FindWindowW(str16 cls, str16 name)'),
    SetWindowLongPtrW: lib.func('intptr_t __stdcall SetWindowLongPtrW(intptr_t hwnd, int index, intptr_t value)'),
    SetWindowPos: lib.func('bool __stdcall SetWindowPos(intptr_t hwnd, intptr_t after, int x, int y, int cx, int cy, uint flags)'),
  };
  return user32;
}

const GWLP_HWNDPARENT = -8; // the owner window
const HWND_BOTTOM = 1;
const SWP_KEEP = 0x0001 | 0x0002 | 0x0010; // keep size, keep position, don't activate

const hwndOf = (win) => {
  const buf = win.getNativeWindowHandle();
  return Number(buf.length >= 8 ? buf.readBigUInt64LE(0) : buf.readUInt32LE(0));
};

function available() {
  try { return Boolean(load()); } catch { return false; }
}

// Drops the window to the bottom of the stack, just above the desktop.
function sendToBack(win) {
  if (!load()) return;
  user32.SetWindowPos(hwndOf(win), HWND_BOTTOM, 0, 0, 0, 0, SWP_KEEP);
}

function pin(win) {
  if (!load()) return false;
  const desktop = user32.FindWindowW('Progman', null);
  if (!desktop) return false;
  user32.SetWindowLongPtrW(hwndOf(win), GWLP_HWNDPARENT, desktop);
  sendToBack(win);
  return true;
}

function unpin(win) {
  if (!load()) return;
  user32.SetWindowLongPtrW(hwndOf(win), GWLP_HWNDPARENT, 0);
}

module.exports = { available, pin, unpin, sendToBack };
