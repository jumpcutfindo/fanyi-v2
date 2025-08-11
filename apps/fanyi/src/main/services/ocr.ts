import { spawn } from 'child_process';
import path from 'node:path';

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

export { runOcr };
