/* eslint-disable @typescript-eslint/no-explicit-any */
import { desktopCapturer } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getScreenshotSources, takeScreenshotWithPreset } from './screenshot';

import { CustomScreenshotPreset } from '@shared/types/screenshot';

vi.mock('electron', () => ({
  desktopCapturer: {
    getSources: vi.fn(),
  },
}));

vi.mock('@main/logger');

describe('screenshot service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getScreenshotSources', () => {
    it('should return mapped sources with correct types and sizes', async () => {
      const mockSources = [
        {
          id: 'screen:1:0',
          name: 'Primary Monitor',
          thumbnail: {
            getSize: () => ({ width: 1920, height: 1080 }),
          },
        },
        {
          id: 'window:123:0',
          name: 'Calculator',
          thumbnail: {
            getSize: () => ({ width: 400, height: 600 }),
          },
        },
      ];
      (desktopCapturer.getSources as any).mockResolvedValue(mockSources);

      const sources = await getScreenshotSources();

      expect(sources).toHaveLength(2);
      expect(sources[0]).toEqual({
        id: 'screen:1:0',
        name: 'Primary Monitor',
        type: 'screen',
        size: { width: 1920, height: 1080 },
      });
      expect(sources[1]).toEqual({
        id: 'window:123:0',
        name: 'Calculator',
        type: 'window',
        size: { width: 400, height: 600 },
      });
      expect(desktopCapturer.getSources).toHaveBeenCalledWith({
        types: ['screen', 'window'],
        thumbnailSize: { width: 2560, height: 1440 },
      });
    });
  });

  describe('takeScreenshotWithPreset', () => {
    const mockBuffer = Buffer.from('fake-png-data');

    it('should capture full screen when no crop is provided', async () => {
      const mockSource = {
        id: 'screen:1:0',
        thumbnail: {
          toPNG: vi.fn().mockReturnValue(mockBuffer),
        },
      };
      (desktopCapturer.getSources as any).mockResolvedValue([mockSource]);

      const preset: CustomScreenshotPreset = {
        id: 'preset-1',
        name: 'Full Screen',
        type: 'custom',
        description: 'Full screen capture',
        options: {
          type: 'screen',
          sourceId: 'screen:1:0',
        },
      };

      const result = await takeScreenshotWithPreset(preset);

      expect(result).toBe(mockBuffer);
      expect(mockSource.thumbnail.toPNG).toHaveBeenCalled();
    });

    it('should capture cropped area when crop options are provided', async () => {
      const mockCroppedThumbnail = {
        toPNG: vi.fn().mockReturnValue(mockBuffer),
      };
      const mockSource = {
        id: 'screen:1:0',
        thumbnail: {
          crop: vi.fn().mockReturnValue(mockCroppedThumbnail),
        },
      };
      (desktopCapturer.getSources as any).mockResolvedValue([mockSource]);

      const crop = { x: 100, y: 100, width: 500, height: 300 };
      const preset: CustomScreenshotPreset = {
        id: 'preset-2',
        name: 'Crop Area',
        type: 'custom',
        description: 'Cropped capture',
        options: {
          type: 'screen',
          sourceId: 'screen:1:0',
          crop,
        },
      };

      const result = await takeScreenshotWithPreset(preset);

      expect(result).toBe(mockBuffer);
      expect(mockSource.thumbnail.crop).toHaveBeenCalledWith(crop);
      expect(mockCroppedThumbnail.toPNG).toHaveBeenCalled();
    });

    it('should throw an error if the specified sourceId is not found', async () => {
      (desktopCapturer.getSources as any).mockResolvedValue([]);

      const preset: CustomScreenshotPreset = {
        id: 'preset-3',
        name: 'Invalid Source',
        type: 'custom',
        description: 'Should fail',
        options: {
          type: 'screen',
          sourceId: 'non-existent-id',
        },
      };

      await expect(takeScreenshotWithPreset(preset)).rejects.toThrow(
        'No screen found to capture.'
      );
    });

    it('should propagate and log errors from desktopCapturer', async () => {
      const error = new Error('Capturer failed');
      (desktopCapturer.getSources as any).mockRejectedValue(error);

      const preset: CustomScreenshotPreset = {
        id: 'preset-4',
        name: 'Fail',
        type: 'custom',
        description: 'Should fail',
        options: {
          type: 'screen',
          sourceId: 'any',
        },
      };

      await expect(takeScreenshotWithPreset(preset)).rejects.toThrow(
        'Capturer failed'
      );
    });
  });
});
