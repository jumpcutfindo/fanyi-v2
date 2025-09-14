import { useQuery } from '@tanstack/react-query';

export function getSystemOsQuery() {
  return useQuery({
    queryKey: ['get-system-os'],
    queryFn: () => window.api.getSystemOs(),
  });
}
