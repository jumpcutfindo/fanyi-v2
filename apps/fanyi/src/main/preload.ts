import { contextBridge, ipcRenderer } from 'electron';

import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResponse } from '@shared/types/ocr';
import { UserPreferences } from '@shared/types/preferences';
import {
  AddScreenshotPresetPayload,
  CustomScreenshotPreset,
  ScreenshotSource,
} from '@shared/types/screenshot';

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
  removeAllListeners: (
    ...args: Parameters<typeof ipcRenderer.removeAllListeners>
  ) => {
    const [channel, ...omit] = args;
    return ipcRenderer.removeAllListeners(channel, ...omit);
  },
});

contextBridge.exposeInMainWorld('api', {
  getScreenshotWithPreset: (preset: CustomScreenshotPreset): Promise<Buffer> =>
    ipcRenderer.invoke('take-screenshot-with-preset', preset),
  getScreenshotSources: (): Promise<ScreenshotSource[]> =>
    ipcRenderer.invoke('get-screenshot-sources'),

  addScreenshotPreset: (preset: AddScreenshotPresetPayload): Promise<void> =>
    ipcRenderer.invoke('add-screenshot-preset', preset),
  getScreenshotPresets: (): Promise<CustomScreenshotPreset[]> =>
    ipcRenderer.invoke('get-screenshot-presets'),
  updateScreenshotPreset: (preset: CustomScreenshotPreset): Promise<void> =>
    ipcRenderer.invoke('update-screenshot-preset', preset),
  deleteScreenshotPreset: (id: string): Promise<void> =>
    ipcRenderer.invoke('delete-screenshot-preset', id),

  getUsedKeybinds: () => ipcRenderer.invoke('get-used-keybinds'),
  enableKeybinds: () => ipcRenderer.invoke('enable-keybinds'),
  disableKeybinds: () => ipcRenderer.invoke('disable-keybinds'),

  performOcrWithScreenshot: (buffer: Buffer): Promise<OcrResponse> =>
    ipcRenderer.invoke('perform-ocr-with-screenshot', buffer),
  getOcrStatus: () => ipcRenderer.invoke('get-ocr-status'),

  getDictionaryEntryOfWord: (word: string): Promise<DictionaryEntry | null> =>
    ipcRenderer.invoke('get-dictionary-entry-of-word', word),

  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  setPreference: (
    key: keyof UserPreferences,
    value: UserPreferences[keyof UserPreferences]
  ) => ipcRenderer.invoke('set-preference', key, value),

  getSystemOs: () => ipcRenderer.invoke('get-system-os'),

  openExternalLink: (url: string) =>
    ipcRenderer.invoke('open-external-link', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
