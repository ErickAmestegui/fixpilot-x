import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const browserPath = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((path):path is string=>!!path&&existsSync(path));

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e.spec.ts','rescue.e2e.spec.ts','challenge.e2e.spec.ts','podium.e2e.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1600, height: 1000 },
    locale: 'es-BO',
    timezoneId: 'America/La_Paz',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      ...(browserPath ? { executablePath: browserPath } : {}),
      args: ['--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
    },
  },
  // Start the app separately with npm run dev. Tests never spawn a duplicate server.
});
