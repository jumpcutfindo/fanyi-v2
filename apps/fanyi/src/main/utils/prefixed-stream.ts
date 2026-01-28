import { Writable, WritableOptions } from 'node:stream';
import Logger from 'electron-log';

import { logger } from '@main/logger';

export class PrefixedStream extends Writable {
  private prefix: string;
  private remainder: string = '';

  private ocrLogger: Logger.LogFunctions;

  constructor(prefix: string, options?: WritableOptions) {
    super(options);
    this.prefix = prefix;

    this.ocrLogger = logger.scope('OCR');
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
