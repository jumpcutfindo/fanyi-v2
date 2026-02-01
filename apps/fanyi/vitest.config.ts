import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * For electron applications, need to define aliases in all Vite instances
 * See https://github.com/vitejs/vite/discussions/19060#discussioncomment-13323420
 */
const alias = {
  '@main': path.resolve(__dirname, 'src/main'),
  '@renderer': path.resolve(__dirname, 'src/renderer'),
  '@shared': path.resolve(__dirname, 'src/shared'),
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    alias,
  },
});
