import { Writable, WritableOptions } from 'node:stream';
import Logger from 'electron-log';

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
    const data = this.remainder + chunk.toString();
    const lines = data.split('\n');

    this.remainder = lines.pop() || '';

    lines.forEach((line) => {
      if (line.length > 0) {
        this.ocrLogger.info(`${line}`);
      }
    });

    callback();
  }
}
