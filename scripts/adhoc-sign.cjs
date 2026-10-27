// electron-builder afterSign hook. Without an Apple Developer ID the Mac app isn't signed, and
// Apple Silicon reports unsigned apps as "damaged". An ad-hoc signature fixes that; macOS then
// only asks for a right-click → Open the first time.
const { execFileSync } = require('node:child_process');
const path = require('node:path');

exports.default = async function adhocSign(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
