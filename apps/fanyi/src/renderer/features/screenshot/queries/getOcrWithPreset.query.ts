import { ScreenshotPreset } from '@shared/types/screenshot';
import { useQuery } from '@tanstack/react-query';

export function useGetOcrWithPresetQuery(id: string, preset: ScreenshotPreset) {
  return useQuery({
    queryKey: ['ocr-with-preset', id],
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return await window.api.performOcrWithPreset(preset);
    },
  });
}
