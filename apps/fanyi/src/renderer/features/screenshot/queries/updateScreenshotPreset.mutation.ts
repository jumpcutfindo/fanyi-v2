import { ScreenshotPreset } from '@shared/types/screenshot';
import { useMutation } from '@tanstack/react-query';

export function useUpdateScreenshotPresetMutation() {
  return useMutation({
    mutationFn: (preset: ScreenshotPreset) => {
      return window.api.updateScreenshotPreset(preset);
    },
  });
}
