import { Writable, WritableOptions } from 'node:stream';
import Logger from 'electron-log';

import { IncomingLogPayload } from '@shared/types/ocr';
import { logger } from '@main/logger';

export class LoggerWithPrefix extends Writable {
  private remainder: string = '';

  private ocrLogger: Logger.LogFunctions;

  constructor(prefix: string, options?: WritableOptions) {
    super(options);

    this.ocrLogger = logger.scope(prefix);
  }

  _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    console.log('blop:', chunk.toString().trim());
    const data = JSON.parse(chunk.toString().trim()) as IncomingLogPayload;

    switch (data.type) {
      case 'info':
        this.ocrLogger.info(data.message);
        break;
      case 'error':
        this.ocrLogger.error(data.message);
        break;
      case 'debug':
        this.ocrLogger.debug(data.message);
        break;
    }

    callback();
  }
}
