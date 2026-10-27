// Renders the Capri logo to the PNGs the desktop app and the phone home-screen app need. Run: npm run icons
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(__dirname, 'icons');
const WEB_OUT = path.join(__dirname, '..', 'public', 'icons');

// Hand-drawn ♑ (Capricorn) glyph on a 24px grid.
const GLYPH = '<path d="M3.6 8.2c1.3-1.3 3.3-.6 3.3 1.6V17.5"/><path d="M6.9 10.6c0-2.9 1.7-4.6 3.8-4.6 2.2 0 3.6 1.6 3.6 4.1v5.4"/><path d="M14.3 15.5a2.75 2.75 0 1 0 2.75-2.75c-1.6 0-2.75 1.3-2.75 2.9 0 2.9-2 4.9-4.7 5.4"/>';

// App icon: gold glyph and a few stars on a midnight-navy tile. Phones round the corners themselves,
// so their icons (bleed) fill the whole square.
const appIcon = (size, bleed = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f2a52"/><stop offset="1" stop-color="#0a0f22"/></linearGradient>
    <linearGradient id="au" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc96"/><stop offset="1" stop-color="#d9a441"/></linearGradient>
  </defs>
  ${bleed ? '<rect width="32" height="32" fill="url(#n)"/>' : '<rect x="1" y="1" width="30" height="30" rx="8" fill="url(#n)"/>'}
  ${size >= 64 ? '<circle cx="24.5" cy="7.5" r=".9" fill="#f6dc96"/><circle cx="27" cy="11" r=".55" fill="#f6dc96" opacity=".7"/><circle cx="6.5" cy="25.5" r=".6" fill="#f6dc96" opacity=".6"/>' : ''}
  <g transform="translate(4.6 4.2) scale(0.95)" fill="none" stroke="url(#au)" stroke-width="${size >= 64 ? 2.1 : 2.6}" stroke-linecap="round" stroke-linejoin="round">${GLYPH}</g>
</svg>`;

// macOS menu-bar template: plain black glyph, the OS tints it.
const template = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><g fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${GLYPH}</g></svg>`;

const phoneIcon = (size) => appIcon(size, true);

const targets = [
  [OUT, 'icon.png', appIcon, 512],
  [OUT, 'tray.png', appIcon, 32],
  [OUT, 'trayTemplate.png', template, 16],
  [OUT, 'trayTemplate@2x.png', template, 32],
  [WEB_OUT, 'apple-touch-icon.png', phoneIcon, 180],
  [WEB_OUT, 'icon-192.png', phoneIcon, 192],
  [WEB_OUT, 'icon-512.png', phoneIcon, 512],
];

// One offscreen window is reused for every size; creating and destroying several in a row is flaky.
let win;
async function render(svg, size) {
  win ||= new BrowserWindow({ show: false, frame: false, transparent: true, webPreferences: { offscreen: true } });
  win.setContentSize(size, size);
  const html = `<html><body style="margin:0;background:transparent;overflow:hidden">${svg}</body></html>`;
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise((r) => setTimeout(r, 300));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: size, height: size });
  return image.resize({ width: size, height: size, quality: 'best' }).toPNG();
}

app.disableHardwareAcceleration();
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  for (const [dir, name, make, size] of targets) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), await render(make(size), size));
    console.log(`wrote ${name} (${size}px)`);
  }
  app.quit();
});
