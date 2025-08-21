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
    performOcrWithPreset: (preset: ScreenshotPreset) => Promise<string>;

    addScreenshotPreset: (preset: AddScreenshotPresetPayload) => Promise<void>;
    getScreenshotPresets: () => Promise<ScreenshotPreset[]>;
    updateScreenshotPreset: (preset: ScreenshotPreset) => Promise<void>;
    deleteScreenshotPreset: (id: string) => Promise<void>;

    getScreenshotWithPreset: (preset: ScreenshotPreset) => Promise<Buffer>;
    getScreenshotSources: () => Promise<ScreenshotSource[]>;
  };
}
