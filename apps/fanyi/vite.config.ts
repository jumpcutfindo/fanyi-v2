import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

/**
 * For electron applications, need to define aliases in all Vite instances
 * See https://github.com/vitejs/vite/discussions/19060#discussioncomment-13323420
 */
const alias = {
  '@main': path.resolve(__dirname, 'src/main'),
  '@renderer': path.resolve(__dirname, 'src/renderer'),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'src/main/main.ts',
        vite: {
          resolve: {
            alias,
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'src/main/preload.ts'),
        vite: {
          resolve: {
            alias,
          },
        },
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
  ],
  resolve: {
    alias,
  },
});
