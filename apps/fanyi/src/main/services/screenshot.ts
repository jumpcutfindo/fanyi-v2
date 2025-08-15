import {
  ScreenshotOptions,
  ScreenshotPreset,
  ScreenshotSource,
} from '@shared/types/screenshot';
import { desktopCapturer } from 'electron';

/**
 * Captures a screenshot of the primary screen and returns it as a Buffer.
 * @returns A Promise that resolves with the screenshot data as a Buffer.
 */
export async function takeScreenshot(
  options: ScreenshotOptions
): Promise<Buffer> {
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

export async function getScreenshotSources(): Promise<ScreenshotSource[]> {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
  });

  return sources.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.id.includes('window') ? 'window' : 'screen',
  }));
}

export async function getScreenshotPresets(): Promise<ScreenshotPreset[]> {
  // TODO: Implement storing to local storage and retrieval

  return [
    {
      name: 'Screen',
      description: 'Take a screenshot of the primary screen.',
      options: {
        type: 'screen',
        sourceId: '',
        crop: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      },
    },
    {
      name: 'Window',
      description: 'Take a screenshot of a specific window.',
      options: {
        type: 'window',
        sourceId: '',
        crop: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        },
      },
    },
  ];
}
