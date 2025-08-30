import { useMutation } from '@tanstack/react-query';

import { AddScreenshotPresetPayload } from '@shared/types/screenshot';

export function useAddScreenshotPresetMutation() {
  return useMutation({
    mutationFn: (preset: AddScreenshotPresetPayload) => {
      return window.api.addScreenshotPreset(preset);
    },
  });
}
