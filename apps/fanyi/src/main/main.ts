import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';

import { registerIpcHandlers } from '@main/ipc';
import { initDictionary } from '@main/services/dictionary';
import { registerDefaultKeybinds } from '@main/services/keybinds';
import { cleanUpPythonOcr, initPythonOcr } from '@main/services/ocr';
import {
  addPreferenceChangeListener,
  getPreferences,
} from '@main/services/preferences';
import { registerPresetKeybinds } from '@main/services/presets';
import { getBackgroundColor, getTitlebarStyle } from '@main/utils/styles';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

export let win: BrowserWindow | null;

async function createWindow() {
  const { isDarkMode } = await getPreferences();

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    width: 1024,
    height: 768,

    backgroundColor: getBackgroundColor(isDarkMode),
    titleBarStyle: 'hidden',
    titleBarOverlay: getTitlebarStyle(isDarkMode),
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Clean up underlying processes
  cleanUpPythonOcr();
});

app.whenReady().then(() => {
  registerIpcHandlers();

  // Register keybinds on app startup
  registerDefaultKeybinds();
  registerPresetKeybinds();

  // Setup underlying processes
  initPythonOcr();
  initDictionary();

  // Register change listener for dark mode
  addPreferenceChangeListener((preferences) => {
    if (!win || !preferences) {
      return;
    }

    win.setTitleBarOverlay(getTitlebarStyle(preferences.isDarkMode));
  });

  createWindow();
});
