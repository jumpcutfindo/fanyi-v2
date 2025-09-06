import { useMutation } from '@tanstack/react-query';

import { CustomScreenshotPreset } from '@shared/types/screenshot';

export function useUpdateScreenshotPresetMutation() {
  return useMutation({
    mutationFn: (preset: CustomScreenshotPreset) => {
      return window.api.updateScreenshotPreset(preset);
    },
  });
}
