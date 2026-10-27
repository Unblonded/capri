// The desktop app pins itself to the Windows desktop through koffi, whose Windows binary ships as a
// separate package that npm only installs on Windows. When building the Windows app elsewhere
// (a Mac with Wine), fetch it so it ends up in the installer.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

if (process.platform !== 'win32') {
  const { version } = JSON.parse(fs.readFileSync(new URL('../node_modules/koffi/package.json', import.meta.url), 'utf8'));
  execSync(`npm install --no-save --force @koromix/koffi-win32-x64@${version}`, { stdio: 'inherit' });
}
