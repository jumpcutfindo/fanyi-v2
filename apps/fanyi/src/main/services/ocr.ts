import { spawn } from 'child_process';
import fs from 'fs';
import { ChildProcess } from 'node:child_process';
import path from 'node:path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import { OcrResult, OcrStatus } from '@shared/types/ocr';
import { logger } from '@main/logger';
import { LoggerWithPrefix } from '@main/utils/prefixed-stream';

enum FileDescriptors {
  DATA_OUT = 3,
  DATA_IN = 4,
  LOGS = 5,
}

let pythonOcr: ChildProcess | null;

let logStream: fs.ReadStream | null;
let outgoingDataStream: fs.WriteStream | null;
let incomingDataStream: fs.ReadStream | null;

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

  logger.info('Starting python OCR service', pythonExecutable);

  pythonOcr = spawn(pythonExecutable, {
    stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streams = pythonOcr.stdio as any;

  // Create streams
  logStream = streams[FileDescriptors.LOGS] as unknown as fs.ReadStream;
  logStream.pipe(new LoggerWithPrefix('OCR')); // Pipe to logger

  incomingDataStream = streams[
    FileDescriptors.DATA_IN
  ] as unknown as fs.ReadStream;

  outgoingDataStream = streams[
    FileDescriptors.DATA_OUT
  ] as unknown as fs.WriteStream;

  const onReady = (data: string | Buffer<ArrayBufferLike>) => {
    if (!incomingDataStream) return;

    if (data.toString().includes('Models are ready.')) {
      logger.info('Python OCR service is ready!');
      ocrStatus = 'available';

      // Remove the listener
      incomingDataStream.removeListener('data', onReady);
    }
  };

  // Check for ready message
  incomingDataStream.on('data', onReady);
}

function cleanUpPythonOcr() {
  if (pythonOcr) {
    ocrStatus = 'shutdown';
    logger.info('Stopping python OCR service...');

    // Close streams
    logStream?.close();
    incomingDataStream?.close();

    pythonOcr.kill();
  }
}

function getOcrStatus(): Promise<OcrStatus> {
  return Promise.resolve(ocrStatus);
}

function runOcr(imageBuffer: Buffer): Promise<OcrResult> {
  return new Promise((resolve, reject) => {
    // 1. Ensure the persistent process is running
    if (
      !pythonOcr ||
      pythonOcr.killed ||
      !incomingDataStream ||
      !outgoingDataStream
    ) {
      return reject(
        new Error('Python OCR service is not initialized or is closed.')
      );
    }

    const process = pythonOcr;
    let receivedData = '';

    // Create a one-time listener for the response
    const onData = (data: string | Buffer<ArrayBufferLike>) => {
      if (!incomingDataStream) return;

      receivedData += data.toString('utf-8');

      // Look for a newline character to signal the end of the response
      if (receivedData.includes('\n')) {
        const responseLine = receivedData.trim();

        // Remove the listener to avoid processing old data on the next request
        incomingDataStream.removeListener('data', onData);
        incomingDataStream.removeListener('data', onError);

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

    const onError = (data: string | Buffer<ArrayBufferLike>) => {
      const error = data.toString('utf-8');
      logger.error(`Python stderr: ${error}`);
    };

    // Attach listeners for this specific request
    incomingDataStream.on('data', onData);
    incomingDataStream.on('data', onError);

    // Handle potential disconnects
    const onClose = (code: number) => {
      if (!incomingDataStream) return;

      incomingDataStream.removeListener('data', onData);
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

      logger.debug(`Wrote image to ${tempFilePath}`);

      // 3. Write the command and data to the Python process's stdin
      outgoingDataStream.write('run-ocr\n');
      outgoingDataStream.write(`${tempFilePath}\n`);
    } catch (err) {
      // Clean up in case of an immediate write error
      incomingDataStream.removeListener('data', onData);
      incomingDataStream.removeListener('data', onError);
      reject(new Error(`Failed to write to Python process: ${err}`));
    }
  });
}

export { initPythonOcr, cleanUpPythonOcr, getOcrStatus, runOcr };
