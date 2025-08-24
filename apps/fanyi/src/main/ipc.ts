// src/main/ipc.ts
import { ipcMain } from 'electron';
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

import { getOcrStatus, runOcr } from './services/ocr';

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
  ipcMain.handle('perform-ocr-with-preset', async (_event, preset) => {
    try {
      const imageResult = await takeScreenshotWithPreset(preset);
      const ocrResult = await runOcr(imageResult);
      return ocrResult;
    } catch (error) {
      console.error('Failed to handle OCR request:', error);
      throw error;
    }
  });

  ipcMain.handle('get-ocr-status', async (_event) => {
    return getOcrStatus();
  });
}
