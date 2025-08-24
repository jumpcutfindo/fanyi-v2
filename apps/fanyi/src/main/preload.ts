import { OcrResponse } from '@shared/types/ocr';
import {
  AddScreenshotPresetPayload,
  ScreenshotPreset,
  ScreenshotSource,
} from '@shared/types/screenshot';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (...args: Parameters<typeof ipcRenderer.on>) => {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off: (...args: Parameters<typeof ipcRenderer.off>) => {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send: (...args: Parameters<typeof ipcRenderer.send>) => {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke: (...args: Parameters<typeof ipcRenderer.invoke>) => {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

contextBridge.exposeInMainWorld('api', {
  getScreenshotWithPreset: (preset: ScreenshotPreset): Promise<Buffer> =>
    ipcRenderer.invoke('take-screenshot-with-preset', preset),
  getScreenshotSources: (): Promise<ScreenshotSource[]> =>
    ipcRenderer.invoke('get-screenshot-sources'),

  addScreenshotPreset: (preset: AddScreenshotPresetPayload): Promise<void> =>
    ipcRenderer.invoke('add-screenshot-preset', preset),
  getScreenshotPresets: (): Promise<ScreenshotPreset[]> =>
    ipcRenderer.invoke('get-screenshot-presets'),
  updateScreenshotPreset: (preset: ScreenshotPreset): Promise<void> =>
    ipcRenderer.invoke('update-screenshot-preset', preset),
  deleteScreenshotPreset: (id: string): Promise<void> =>
    ipcRenderer.invoke('delete-screenshot-preset', id),

  performOcrWithPreset: (preset: ScreenshotPreset): Promise<OcrResponse> =>
    ipcRenderer.invoke('perform-ocr-with-preset', preset),
  getOcrStatus: () => ipcRenderer.invoke('get-ocr-status'),
});
