// Renders the Capri logo to the PNGs the desktop app and the phone home-screen app need. Run: npm run icons
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(__dirname, 'icons');
const WEB_OUT = path.join(__dirname, '..', 'public', 'icons');

// Summit check: a faded mountain ridge with a gold check climbing out of it ("steady climb"), on a 32px grid.
const RIDGE = '<path d="M3 26 11.5 15l4 4.5"/>';
const CHECK = '<path d="M8 22.5l5.5 4.5L27.5 7.5"/>';

// App icon: gold check over a slate ridge and a few stars on a midnight-navy tile. Phones round the
// corners themselves, so their icons (bleed) fill the whole square.
const appIcon = (size, bleed = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26346a"/><stop offset="1" stop-color="#0b1026"/></linearGradient>
    <linearGradient id="au" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#d9a441"/><stop offset="1" stop-color="#fbe7ad"/></linearGradient>
  </defs>
  ${bleed ? '<rect width="32" height="32" fill="url(#n)"/>' : '<rect x="1" y="1" width="30" height="30" rx="8" fill="url(#n)"/>'}
  ${size >= 64 ? '<circle cx="24" cy="21" r=".8" fill="#f6dc96" opacity=".8"/><circle cx="7" cy="8" r=".6" fill="#f6dc96" opacity=".6"/><circle cx="12" cy="5" r=".45" fill="#fff" opacity=".5"/>' : ''}
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#5a6aa8" stroke-width="2.4" opacity=".7">${RIDGE}</g>
    <g stroke="url(#au)" stroke-width="${size >= 64 ? 3.2 : 3.6}">${CHECK}</g>
  </g>
</svg>`;

// macOS menu-bar template: plain black glyph, the OS tints it.
const template = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><g fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><g opacity=".45">${RIDGE}</g>${CHECK}</g></svg>`;

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
