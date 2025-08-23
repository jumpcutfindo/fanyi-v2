import { Writable, WritableOptions } from 'node:stream';

export class PrefixedStream extends Writable {
  private prefix: string;
  private remainder: string = '';

  constructor(prefix: string, options?: WritableOptions) {
    super(options);
    this.prefix = prefix;
  }

  _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    const data = this.remainder + chunk.toString();
    const lines = data.split('\n');

    this.remainder = lines.pop() || '';

    lines.forEach((line) => {
      if (line.length > 0) {
        process.stdout.write(`${this.prefix} ${line}\n`);
      }
    });

    callback();
  }
}
