import { spawn } from 'child_process';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'os';
import { app, BrowserWindow } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function getPythonExecutablePath(): string {
  // In development, the executable is in the pyinstaller dist folder
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..', '..', 'python-ocr', 'dist', 'fanyi_ocr');
  }

  // In a packaged app, the executable is in the resources path
  const executableName =
    process.platform === 'win32' ? 'fanyi_ocr.exe' : 'fanyi_ocr';
  return path.join(process.resourcesPath, executableName);
}

function runOcr(imageData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonExecutable = getPythonExecutablePath();
    try {
      console.log('Spawning python process at:', pythonExecutable);
      const pythonProcess = spawn(pythonExecutable);

      const buffers: Buffer[] = [];
      pythonProcess.stdout.on('data', (data: Buffer) => {
        // Collect the raw data buffers
        buffers.push(data);
      });

      pythonProcess.stderr.on('data', (data) => {
        // Handle stderr for debugging
        const error = data.toString('utf-8');
        console.error(`Python stderr received: ${error}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process closed with code: ${code}`);
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}`));
        }

        // Concatenate all buffers and decode to a UTF-8 string
        const resultBuffer = Buffer.concat(buffers);
        const result = resultBuffer.toString();

        try {
          const resultBuffer = Buffer.concat(buffers);
          const result = resultBuffer.toString('utf-8');

          // --- NEW LOGIC TO WRITE TO A FILE ---
          const outputFileName = `ocr_result.txt`;
          const outputPath = path.join(os.tmpdir(), outputFileName);

          fs.writeFileSync(outputPath, result, 'utf-8');
          console.log(`OCR result written to file: ${outputPath}`);
          // --- END OF NEW LOGIC ---

          resolve(result);
        } catch (err) {
          console.error('Error handling Python output:', err);
          reject(err);
        }

        resolve(result);
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        reject(err);
      });

      console.log('Writing image data to Python process...');
      pythonProcess.stdin.write(imageData);
      pythonProcess.stdin.end();
    } catch (err) {
      console.error('Error in runOcr function:', err);
      reject(err);
    }
  });
}

function createWindow() {
  runOcr(
    fs.readFileSync(path.join(process.env.VITE_PUBLIC, 'example-image.png'))
  );

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
