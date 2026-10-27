// Updates a Capri server: pulls the latest code, installs packages, and on Windows rebuilds the
// desktop app whenever its version changes, so installed desktop apps can update themselves from
// <server>/updates. Run with `npm run update`, update.bat or update.sh.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit', env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' } });

// npm install rewrites package-lock.json on the server, and any edited tracked file blocks the pull.
// Set those changes aside (recoverable with `git stash list` / `git stash pop`) rather than failing.
let changed = execSync('git status --porcelain --untracked-files=no', { cwd: root, encoding: 'utf8' }).trim();
// The lockfile alone is just npm's rewrite: drop it instead of piling up a stash on every update.
if (/^M{1,2}\s+package-lock\.json$/.test(changed)) {
  run('git checkout -- package-lock.json');
  changed = '';
}
if (changed) {
  console.log(`Setting aside local changes so the update can apply:\n${changed}\n`);
  run('git stash push -m "capri-update: local changes before update"');
}

run('git pull --ff-only');

const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
let hosted = null;
try { hosted = /^version:\s*(\S+)/m.exec(fs.readFileSync(path.join(root, 'dist', 'latest.yml'), 'utf8'))[1]; } catch { /* nothing built yet */ }

// Building the Windows installer needs Windows (or Wine). Pass --desktop to force it elsewhere.
const canBuild = process.platform === 'win32' || process.argv.includes('--desktop');

if (canBuild) {
  run('npm install');
  if (hosted !== version) {
    console.log(`\nBuilding Capri desktop ${version} for /updates (was ${hosted || 'none'})…`);
    run('npx electron-builder --win nsis --publish never');
  } else {
    console.log(`\nDesktop app ${version} is already built.`);
  }
} else {
  run('npm install --omit=dev');
}

console.log(`\nCapri ${version} is up to date.`);
