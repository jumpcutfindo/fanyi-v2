import { useQuery } from '@tanstack/react-query';

import { CustomScreenshotPreset } from '@shared/types/screenshot';

export function useGetOcrWithPresetQuery(
  id: string,
  preset: CustomScreenshotPreset
) {
  return useQuery({
    queryKey: ['ocr-with-preset', id],

    // Update all these settings to ideally disable any refetches
    gcTime: Infinity,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,

    queryFn: async () => {
      return await window.api.performOcrWithPreset(preset);
    },
  });
}
