import { useQuery } from '@tanstack/react-query';

export function useGetSystemOsQuery() {
  return useQuery({
    queryKey: ['get-system-os'],
    queryFn: () => window.api.getSystemOs(),
  });
}
