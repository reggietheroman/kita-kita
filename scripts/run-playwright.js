#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const { ensurePlaywrightBrowser } = require('./ensure-playwright-browser');

const root = path.resolve(__dirname, '..');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const playwrightArgs = process.argv.slice(2);

if (playwrightArgs.length === 0) {
  console.error('Usage: node scripts/run-playwright.js test [Playwright options]');
  process.exit(1);
}

ensurePlaywrightBrowser();

const result = spawnSync(npxCommand, ['--no-install', 'playwright', ...playwrightArgs], {
  cwd: root,
  env: {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: '0',
  },
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Playwright runner could not start: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
