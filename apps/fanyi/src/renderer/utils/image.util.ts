import { Buffer } from 'buffer';

export function imageBase64ToBlob(
  base64: string,
  contentType = 'image/png',
  sliceSize = 512
) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function blobToImageBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert Blob to Base64 string.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('FileReader failed to read the Blob.'));
    };

    // Read the blob as a data URL, which is a Base64 string.
    reader.readAsDataURL(blob);
  });
}

export function pngToBuffer(pngString: string) {
  // 1. Remove the data URI header
  const base64String = pngString.replace(/^data:image\/png;base64,/, '');

  // 2. Decode from Base64
  const binaryString = atob(base64String);

  // 3. Create a Buffer
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return Buffer.from(bytes);
}

export function bufferToPng(buffer: Buffer) {
  const imageString = buffer
    ? btoa(
        new Uint8Array(buffer).reduce(function (data, byte) {
          return data + String.fromCharCode(byte);
        }, '')
      )
    : null;

  return `data:image/png;base64,${imageString}`;
}
