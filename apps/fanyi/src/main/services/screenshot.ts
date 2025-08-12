import { desktopCapturer } from 'electron';

/**
 * Captures a screenshot of the primary screen and returns it as a Buffer.
 * @returns A Promise that resolves with the screenshot data as a Buffer.
 */
export async function takeScreenshot(_options: unknown): Promise<Buffer> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    const primarySource = sources[0];
    if (primarySource) {
      // Return the screenshot as a Buffer
      return primarySource.thumbnail.toPNG();
    } else {
      throw new Error('No screen found to capture.');
    }
  } catch (err) {
    console.error('Failed to capture screenshot:', err);
    throw err;
  }
}
