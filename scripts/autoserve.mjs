// Runs the Capri server and keeps it on the latest commit: every minute it checks GitHub, and when
// there's something new it runs the normal update (scripts/update.mjs) and restarts the server.
// It also brings the server back if it crashes. Start it with start-server.bat, ./start-server.sh
// or `npm run serve:auto`. CAPRI_UPDATE_EVERY sets the check interval in seconds (default 60).
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const self = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(self), '..');
const EVERY = Math.max(15, Number(process.env.CAPRI_UPDATE_EVERY) || 60) * 1000;
// Exit code asking start-server.bat / .sh to start this script again (it was itself updated).
const RELAUNCH = 75;

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
const git = (args) => execSync(`git ${args}`, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

let server = null;
let stopping = false;

function startServer() {
  stopping = false;
  server = spawn(process.execPath, ['server.js'], { cwd: root, stdio: 'inherit' });
  server.on('exit', (code, signal) => {
    server = null;
    if (stopping) return;
    log(`Server stopped (${signal || `code ${code}`}); starting it again in 3s…`);
    setTimeout(startServer, 3000);
  });
}

function stopServer() {
  if (!server) return Promise.resolve();
  stopping = true;
  return new Promise((resolve) => {
    server.once('exit', resolve);
    server.kill();
  });
}

function runUpdate() {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ['scripts/update.mjs'], { cwd: root, stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`update exited with code ${code}`))));
    p.on('error', reject);
  });
}

let busy = false;
async function check() {
  if (busy) return;
  busy = true;
  try {
    git('fetch --quiet');
    const behind = Number(git('rev-list --count HEAD..@{u}'));
    if (!behind) return;
    log(`${behind} new commit${behind > 1 ? 's' : ''} on GitHub: ${git('log -1 --format=%s @{u}')}`);
    const before = fs.readFileSync(self, 'utf8');
    // The old server keeps serving while packages install and the desktop app builds.
    await runUpdate();
    if (fs.readFileSync(self, 'utf8') !== before) {
      log('The auto-updater itself changed; relaunching it.');
      await stopServer();
      process.exit(RELAUNCH);
    }
    log('Restarting the server on the new version…');
    await stopServer();
    startServer();
  } catch (err) {
    log(`Update check failed: ${err.message.split('\n')[0]}. Trying again later.`);
  } finally {
    busy = false;
  }
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => { await stopServer(); process.exit(0); });
}

log(`Capri auto-update is on: checking GitHub every ${EVERY / 1000}s.`);
startServer();
check();
setInterval(check, EVERY);
