import { useQuery } from '@tanstack/react-query';

export function useGetOcrWithScreenshotQuery(id: string, screenshot: Buffer) {
  return useQuery({
    queryKey: ['ocr-with-preset', id],

    // Update all these settings to ideally disable any refetches
    gcTime: Infinity,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,

    queryFn: async () => {
      return await window.api.performOcrWithScreenshot(screenshot);
    },
  });
}
