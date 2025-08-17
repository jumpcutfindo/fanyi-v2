import { useQuery } from "@tanstack/react-query";

export function useGetScreenshotSources() {
  return useQuery({
    queryKey: ["screenshot-sources"],
    queryFn: () => window.api.getScreenshotSources(),
  });
}
