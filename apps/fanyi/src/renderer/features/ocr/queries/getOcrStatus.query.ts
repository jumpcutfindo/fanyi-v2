import { useQuery } from '@tanstack/react-query';

export function useGetOcrStatusQuery() {
  return useQuery({
    queryKey: ['ocr-status'],
    queryFn: () => window.api.getOcrStatus(),
    refetchInterval: 2000,
  });
}
