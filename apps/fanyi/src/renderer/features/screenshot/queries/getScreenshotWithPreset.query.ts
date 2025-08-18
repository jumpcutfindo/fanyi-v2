import { ScreenshotPreset } from '@shared/types/screenshot';
import { useQuery } from '@tanstack/react-query';

export function useGetScreenshotWithPreset(preset: ScreenshotPreset | null) {
  return useQuery({
    queryKey: ['screenshot-with-preset', preset],
    queryFn: async () => {
      const buffer = await window.api.getScreenshotWithPreset(preset);

      const imageString = buffer
        ? btoa(
            new Uint8Array(buffer).reduce(function (data, byte) {
              return data + String.fromCharCode(byte);
            }, '')
          )
        : null;

      return `data:image/png;base64,${imageString}`;
    },
    enabled: !!preset,
  });
}
