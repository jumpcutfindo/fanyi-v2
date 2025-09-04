import { useQuery } from '@tanstack/react-query';

import { ScreenshotPreset } from '@shared/types/screenshot';
import { bufferToPng } from '@renderer/utils/image.util';

export function useGetScreenshotWithPreset(preset: ScreenshotPreset | null) {
  return useQuery({
    queryKey: ['screenshot-with-preset', preset],
    refetchInterval: 1000,
    queryFn: async () => {
      const buffer = await window.api.getScreenshotWithPreset(preset);
      return bufferToPng(buffer);
    },
    enabled: !!preset,
  });
}
