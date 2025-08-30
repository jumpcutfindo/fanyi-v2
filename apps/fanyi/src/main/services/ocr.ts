import { spawn } from 'child_process';
import fs from 'fs';
import { ChildProcess } from 'node:child_process';
import path from 'node:path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import { OcrResult, OcrStatus } from '@shared/types/ocr';
import { PrefixedStream } from '@main/utils/prefixed-stream';

let pythonOcr: ChildProcess | null;
let ocrStatus: OcrStatus = 'startup';

function getPythonExecutablePath(): string {
  // In development, the executable is in the pyinstaller dist folder
  if (process.env.NODE_ENV === 'development') {
    return path.join(
      process.env.VITE_PUBLIC,
      '..',
      '..',
      'python-ocr',
      'dist',
      'fanyi_ocr'
    );
  }

  // In a packaged app, the executable is in the resources path
  const executableName =
    process.platform === 'win32' ? 'fanyi_ocr.exe' : 'fanyi_ocr';
  return path.join(process.resourcesPath, executableName);
}

function initPythonOcr() {
  ocrStatus = 'startup';

  const pythonExecutable = getPythonExecutablePath();

  console.log('Starting python OCR service', pythonExecutable);

  pythonOcr = spawn(pythonExecutable);

  const prefixedStdout = new PrefixedStream('[OCR]');
  const prefixedStderr = new PrefixedStream('[OCR]');

  // Directly pipe stdout and stderr to the Node.js console
  pythonOcr.stdout?.pipe(prefixedStdout);
  pythonOcr.stderr?.pipe(prefixedStderr);

  const onReady = (data: Buffer) => {
    if (data.toString().includes('Models are ready.')) {
      console.log('Python OCR service is ready!');
      ocrStatus = 'available';

      // Remove the listener
      pythonOcr?.stderr?.removeListener('data', onReady);
    }
  };

  // Check for ready message
  pythonOcr.stderr?.on('data', onReady);
}

function cleanUpPythonOcr() {
  if (pythonOcr) {
    ocrStatus = 'shutdown';
    console.log('Stopping python OCR service');
    pythonOcr.kill();
  }
}

function getOcrStatus(): Promise<OcrStatus> {
  return Promise.resolve(ocrStatus);
}

function runOcr(imageBuffer: Buffer): Promise<OcrResult> {
  return new Promise((resolve, reject) => {
    // 1. Ensure the persistent process is running
    if (!pythonOcr || !pythonOcr.stdin || !pythonOcr.stdout) {
      return reject(
        new Error('Python OCR service is not initialized or is closed.')
      );
    }

    const process = pythonOcr;
    let receivedData = '';

    // Create a one-time listener for the response
    const onData = (data: Buffer) => {
      receivedData += data.toString('utf-8');

      // Look for a newline character to signal the end of the response
      if (receivedData.includes('\n')) {
        const responseLine = receivedData.trim();

        // Remove the listener to avoid processing old data on the next request
        process.stdout?.removeListener('data', onData);
        process.stderr?.removeListener('data', onError);

        // 2. Check for an error signal from the Python process
        if (responseLine === 'ERROR') {
          return reject(
            new Error(
              'Python OCR process returned an error. Check its stderr for details.'
            )
          );
        }

        resolve(JSON.parse(responseLine) as unknown as OcrResult);
      }
    };

    const onError = (data: Buffer) => {
      const error = data.toString('utf-8');
      console.error(`Python stderr: ${error}`);
    };

    // Attach listeners for this specific request
    process.stdout?.on('data', onData);
    process.stderr?.on('data', onError);

    // Handle potential disconnects
    const onClose = (code: number) => {
      process.stdout?.removeListener('data', onData);
      process.stderr?.removeListener('data', onError);
      ocrStatus = 'unavailable';
      reject(new Error(`Python process disconnected with code ${code}.`));
    };

    process.on('close', onClose);

    try {
      const appDataDir = path.join(app.getPath('temp'), 'fanyi');

      // Create folder if not exists
      if (!fs.existsSync(appDataDir)) {
        fs.mkdirSync(appDataDir);
      }

      const tempFileName = `ocr-image_${uuidv4()}.png`;
      const tempFilePath = path.join(appDataDir, tempFileName);

      fs.writeFileSync(tempFilePath, imageBuffer);

      console.log(`Wrote image to ${tempFilePath}`);

      // 3. Write the command and data to the Python process's stdin
      process.stdin?.write('run-ocr\n');
      process.stdin?.write(`${tempFilePath}\n`);
    } catch (err) {
      // Clean up in case of an immediate write error
      process.stdout?.removeListener('data', onData);
      process.stderr?.removeListener('data', onError);
      reject(new Error(`Failed to write to Python process: ${err}`));
    }
  });
}

export { initPythonOcr, cleanUpPythonOcr, getOcrStatus, runOcr };
