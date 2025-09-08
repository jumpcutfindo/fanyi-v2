import { useQuery } from '@tanstack/react-query';

import { CustomScreenshotPreset } from '@shared/types/screenshot';
import { bufferToDataUri } from '@renderer/utils/image.util';

export function useGetScreenshotWithPreset(
  preset: CustomScreenshotPreset | null
) {
  return useQuery({
    queryKey: ['screenshot-with-preset', preset],
    refetchInterval: 1000,
    queryFn: async () => {
      const buffer = await window.api.getScreenshotWithPreset(preset);
      return bufferToDataUri(buffer, 'image/png');
    },
    enabled: !!preset,
  });
}
