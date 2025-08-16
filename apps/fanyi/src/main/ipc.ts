// src/main/ipc.ts
import { ipcMain } from 'electron';
import {
  addScreenshotPreset,
  getScreenshotPresets,
} from '@main/services/presets';
import {
  getScreenshotSources,
  takeScreenshotWithPreset,
} from '@main/services/screenshot';

import { runOcr } from './services/ocr';

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

  /**
   * Listen for OCR requests with image data and invoke the OCR service.
   * ipcMain.handle is used to return the OCR result to the renderer.
   */
  ipcMain.handle('perform-ocr', async (_event) => {
    try {
      const ocrResult = await runOcr();
      return ocrResult;
    } catch (error) {
      console.error('Failed to handle OCR request:', error);
      throw error;
    }
  });
}
