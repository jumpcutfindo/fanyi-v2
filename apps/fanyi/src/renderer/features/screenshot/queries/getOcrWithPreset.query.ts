import { ScreenshotPreset } from '@shared/types/screenshot';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useGetOcrWithPresetMutation(preset: ScreenshotPreset | null) {
  return useMutation({
    mutationFn: async (preset: ScreenshotPreset) => {
      return await window.api.performOcrWithPreset(preset);
    },
    mutationKey: ['perform-ocr-with-preset', preset],
  });
}
