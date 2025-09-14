import os from 'os';
import { ipcMain } from 'electron';
import { getOcrStatus, runOcr } from './services/ocr';

import {
  getDictionaryEntries,
  getRawDictionaryEntry,
} from '@main/services/dictionary';
import {
  disableKeybinds,
  enableKeybinds,
  getUsedKeybinds,
} from '@main/services/keybinds';
import { getPreferences, setPreference } from '@main/services/preferences';
import {
  addScreenshotPreset,
  deleteScreenshotPreset,
  getScreenshotPresets,
  updateScreenshotPreset,
} from '@main/services/presets';
import {
  getScreenshotSources,
  takeScreenshotWithPreset,
} from '@main/services/screenshot';

export function registerIpcHandlers() {
  ipcMain.handle('take-screenshot-with-preset', async (_event, preset) => {
    try {
      const screenshot = await takeScreenshotWithPreset(preset);
      return screenshot;
    } catch (error) {
      console.error('Failed to take screenshot with preset:', error);
      throw error;
    }
  });

  ipcMain.handle('get-screenshot-sources', async (_event) => {
    try {
      const sources = await getScreenshotSources();
      return sources;
    } catch (error) {
      console.error('Failed to get screenshot sources:', error);
      throw error;
    }
  });

  ipcMain.handle('add-screenshot-preset', async (_event, preset) => {
    try {
      await addScreenshotPreset(preset);
    } catch (error) {
      console.error('Failed to add screenshot preset:', error);
      throw error;
    }
  });
  ipcMain.handle('get-screenshot-presets', async (_event) => {
    try {
      const presets = await getScreenshotPresets();
      return presets;
    } catch (error) {
      console.error('Failed to get screenshot presets:', error);
      throw error;
    }
  });
  ipcMain.handle('update-screenshot-preset', async (_event, preset) => {
    try {
      await updateScreenshotPreset(preset);
    } catch (error) {
      console.error('Failed to update screenshot preset:', error);
      throw error;
    }
  });
  ipcMain.handle('delete-screenshot-preset', async (_event, id) => {
    try {
      await deleteScreenshotPreset(id);
    } catch (error) {
      console.error('Failed to delete screenshot preset:', error);
      throw error;
    }
  });

  /**
   * Listen for OCR requests with image data and invoke the OCR service.
   * ipcMain.handle is used to return the OCR result to the renderer.
   */
  ipcMain.handle('perform-ocr-with-screenshot', async (_event, screenshot) => {
    try {
      const ocrResult = await runOcr(screenshot);
      const translations = getDictionaryEntries(ocrResult.segmented_text);
      return { ocrResult, translations };
    } catch (error) {
      console.error('Failed to handle OCR request:', error);
      throw error;
    }
  });

  ipcMain.handle('get-ocr-status', async (_event) => {
    return getOcrStatus();
  });

  ipcMain.handle('get-used-keybinds', async (_event) => {
    return getUsedKeybinds();
  });
  ipcMain.handle('enable-keybinds', async (_event) => {
    enableKeybinds();
  });
  ipcMain.handle('disable-keybinds', async (_event) => {
    disableKeybinds();
  });

  ipcMain.handle('get-dictionary-entry-of-word', async (_event, word) => {
    return getRawDictionaryEntry(word);
  });

  ipcMain.handle('get-preferences', async (_event) => {
    return await getPreferences();
  });

  ipcMain.handle('set-preference', async (_event, key, value) => {
    await setPreference(key, value);
  });

  ipcMain.handle('get-system-os', async (_event) => {
    return os.platform();
  });
}
