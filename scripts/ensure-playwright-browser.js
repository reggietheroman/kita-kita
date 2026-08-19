#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function ensurePlaywrightBrowser() {
  const result = spawnSync(npxCommand, ['--no-install', 'playwright', 'install', 'chromium'], {
    cwd: root,
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH: '0',
    },
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Playwright browser preflight could not start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(
      'Playwright browser preflight failed. Check network access, then run "npm run test:e2e:install" and retry.',
    );
    process.exit(result.status ?? 1);
  }
}

if (require.main === module) {
  ensurePlaywrightBrowser();
}

module.exports = { ensurePlaywrightBrowser };
