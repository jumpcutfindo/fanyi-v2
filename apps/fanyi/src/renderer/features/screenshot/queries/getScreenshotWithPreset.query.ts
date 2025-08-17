import { ScreenshotPreset } from '@shared/types/screenshot';
import { useQuery } from '@tanstack/react-query';

export function useGetScreenshotWithPreset(preset: ScreenshotPreset | null) {
  return useQuery({
    queryKey: ['screenshot-with-preset', preset],
    queryFn: () => window.api.getScreenshotWithPreset(preset),
    enabled: !!preset,
  });
}
