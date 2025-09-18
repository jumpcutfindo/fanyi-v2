import { useQuery } from '@tanstack/react-query';

function useGetAppVersionQuery() {
  return useQuery({
    queryKey: ['app-version'],
    queryFn: () => window.api.getAppVersion(),
  });
}

export { useGetAppVersionQuery };
