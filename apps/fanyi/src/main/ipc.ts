// src/main/ipc.ts
import { ipcMain } from 'electron';
import {
  getScreenshotPresets,
  getScreenshotSources,
  takeScreenshot,
} from '@main/services/screenshot';

import { runOcr } from './services/ocr';

export function registerIpcHandlers() {
  /**
   * Listen for screenshot requests from the renderer and invoke the screenshot service.
   * ipcMain.handle is used for a request-reply pattern.
   */
  ipcMain.handle('screenshot', async (_event, options) => {
    try {
      const screenshotBuffer = await takeScreenshot(options);
      return screenshotBuffer;
    } catch (error) {
      console.error('Failed to handle screenshot request:', error);
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
