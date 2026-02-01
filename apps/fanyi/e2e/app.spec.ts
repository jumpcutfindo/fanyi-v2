import { test, expect, _electron, type ElectronApplication } from '@playwright/test';

let electronApp: ElectronApplication;

test.beforeEach(async () => {
  // Point to the built Electron app's entry point
  electronApp = await _electron.launch({ args: ['./dist-electron/main.js'], cwd: './apps/fanyi' });
});

test.afterEach(async () => {
  // Exit the app
  await electronApp.close();
});

test('App starts and window is visible', async () => {
  // Wait for the first window to open
  const window = await electronApp.firstWindow();

  // Check that the window is visible
  await expect(window).toBeVisible();
});

test('Window has the correct title', async () => {
  // Wait for the first window to open
  const window = await electronApp.firstWindow();

  // Check the window title
  await expect(window).toHaveTitle('Fanyi');
});
