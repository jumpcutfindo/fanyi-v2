import { useQuery } from "@tanstack/react-query";

export function useGetScreenshotPresets() {
  return useQuery({
    queryKey: ["screenshot-presets"],
    queryFn: () => window.api.getScreenshotPresets(),
  });
}
