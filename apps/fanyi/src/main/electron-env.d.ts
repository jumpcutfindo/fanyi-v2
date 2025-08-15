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
    performOcr: () => Promise<string>;

    getScreenshotWithPreset: (preset: ScreenshotPreset) => Promise<Buffer>;
    getScreenshotSources: () => Promise<ScreenshotSource[]>;
    getScreenshotPresets: () => Promise<ScreenshotPreset[]>;
  };
}
