import { useMutation } from '@tanstack/react-query';

import { ScreenshotPreset } from '@shared/types/screenshot';

export function useUpdateScreenshotPresetMutation() {
  return useMutation({
    mutationFn: (preset: ScreenshotPreset) => {
      return window.api.updateScreenshotPreset(preset);
    },
  });
}
