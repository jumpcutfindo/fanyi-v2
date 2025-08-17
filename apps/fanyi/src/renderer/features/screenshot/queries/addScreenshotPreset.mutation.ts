import { AddScreenshotPresetPayload } from "@shared/types/screenshot";
import { useMutation } from "@tanstack/react-query";

export function useAddScreenshotPresetMutation() {
  return useMutation({
    mutationFn: (preset: AddScreenshotPresetPayload) => {
      return window.api.addScreenshotPreset(preset);
    },
  });
}
