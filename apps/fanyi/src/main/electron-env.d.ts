/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer;
  api: {
    getOcrStatus: () => Promise<OcrStatus>;
    performOcrWithScreenshot: (buffer: Buffer) => Promise<OcrResponse>;

    addScreenshotPreset: (preset: AddScreenshotPresetPayload) => Promise<void>;
    getScreenshotPresets: () => Promise<CustomScreenshotPreset[]>;
    updateScreenshotPreset: (preset: CustomScreenshotPreset) => Promise<void>;
    deleteScreenshotPreset: (id: string) => Promise<void>;

    enableKeybinds: () => Promise<void>;
    disableKeybinds: () => Promise<void>;
    getUsedKeybinds: () => Promise<string[]>;

    getScreenshotWithPreset: (
      preset: CustomScreenshotPreset
    ) => Promise<Buffer>;
    getScreenshotSources: () => Promise<ScreenshotSource[]>;

    getDictionaryEntryOfWord(word: string): Promise<DictionaryEntry | null>;

    getPreferences: () => Promise<UserPreferences>;
    setPreference: (
      key: keyof UserPreferences,
      value: UserPreferences[keyof UserPreferences]
    ) => Promise<void>;
  };
}
