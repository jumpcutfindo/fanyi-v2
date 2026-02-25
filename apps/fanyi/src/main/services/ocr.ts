import { spawn } from 'child_process';
import fs from 'fs';
import { ChildProcess } from 'node:child_process';
import path from 'node:path';
import Stream from 'node:stream';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import {
  IncomingDataPayload,
  IncomingLogPayload,
  OcrCommandPayload,
  OcrResult,
  OcrStatus,
} from '@shared/types/ocr';
import { logger } from '@main/logger';

enum FileDescriptors {
  DATA_OUT = 3,
  DATA_IN = 4,
  LOGS = 5,
}

let pythonOcr: ChildProcess | null;

let logStream: Stream.Readable,
  outgoingDataStream: Stream.Writable,
  incomingDataStream: Stream.Readable;

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

/**
 * Handles incoming data from the Python OCR process.
 */
function handleIncomingData(data: string | Buffer<ArrayBufferLike>) {
  try {
    const payload = JSON.parse(data.toString('utf-8')) as IncomingDataPayload;

    switch (payload.action) {
      case 'model_ready':
        logger.info('OCR model is ready to be used');
        ocrStatus = 'available';
        break;
      case 'ocr_result':
        logger.info('Received OCR result from Python process');
        // Handle OCR result if needed
        break;
      case 'error':
        logger.error(`Error observed in OCR process: ${payload.message}`);
        break;
      default:
        logger.warn(`Unknown action received from OCR process: ${payload}`);
    }
  } catch (e) {
    logger.error(`Failed to parse incoming data: ${e}`);
  }
}

/**
 * Handles incoming log data from the Python OCR process.
 */
function handleIncomingLog(data: string | Buffer<ArrayBufferLike>) {
  const ocrLogger = logger.scope('OCR');

  const lines = data.toString('utf-8').trim().split('\n');

  for (const line of lines) {
    try {
      const payload = JSON.parse(line.trim()) as IncomingLogPayload;

      switch (payload.type) {
        case 'info':
          ocrLogger.info(payload.message);
          break;
        case 'error':
          ocrLogger.error(payload.message);
          break;
        case 'debug':
          ocrLogger.debug(payload.message);
          break;
      }
    } catch (e) {
      logger.error(`Failed to parse incoming log data: ${e}`);
    }
  }
}

/**
 * Sends a command to the Python OCR process.
 */
export function sendCommand(command: OcrCommandPayload) {
  if (!outgoingDataStream) {
    throw new Error('Outgoing data stream is not initialized.');
  }

  outgoingDataStream.write(JSON.stringify(command));
  outgoingDataStream.write('\n'); // Newline to signal end of line
}

function initPythonOcr() {
  ocrStatus = 'startup';

  const pythonExecutable = getPythonExecutablePath();

  logger.info('Starting python OCR service', pythonExecutable);

  pythonOcr = spawn(pythonExecutable, {
    // Open additional file descriptors for IPC
    stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PUBLIC_PATH: process.env.VITE_PUBLIC,
      USER_DATA_PATH: app.getPath('userData'),
    },
    windowsHide: true, // Hide console window on launch on Windows
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streams = pythonOcr.stdio as any;

  // Create streams
  logStream = streams[FileDescriptors.LOGS] as unknown as fs.ReadStream;
  logStream.on('data', handleIncomingLog);

  incomingDataStream = streams[
    FileDescriptors.DATA_IN
  ] as unknown as fs.ReadStream;
  incomingDataStream.on('data', handleIncomingData);

  outgoingDataStream = streams[
    FileDescriptors.DATA_OUT
  ] as unknown as fs.WriteStream;
}

function cleanUpPythonOcr() {
  if (pythonOcr) {
    ocrStatus = 'shutdown';
    logger.info('Stopping python OCR service...');

    // Close streams
    logStream?.destroy();
    incomingDataStream?.destroy();
    outgoingDataStream?.destroy();

    sendCommand({ action: 'shutdown' });

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

    // Create a one-time listener for the response
    const onData = (data: string | Buffer<ArrayBufferLike>) => {
      if (!incomingDataStream) return;

      const payload = JSON.parse(data.toString('utf-8')) as IncomingDataPayload;

      // Look for a newline character to signal the end of the response
      if (payload.action === 'ocr_result') {
        // Remove the listener to avoid processing old data on the next request
        incomingDataStream.removeListener('data', onData);
        resolve(payload.data);
      }
    };

    // Attach listeners for this specific request
    incomingDataStream.on('data', onData);

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

      sendCommand({
        action: 'run_ocr',
        image_path: tempFilePath,
      });
    } catch (err) {
      // Clean up in case of an immediate write error
      incomingDataStream.removeListener('data', onData);
      reject(new Error(`Failed to write to Python process: ${err}`));
    }
  });
}

export { initPythonOcr, cleanUpPythonOcr, getOcrStatus, runOcr };
