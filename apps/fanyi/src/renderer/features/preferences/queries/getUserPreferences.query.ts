import { useQuery } from '@tanstack/react-query';

export function useGetUserPreferences() {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => window.api.getPreferences(),
  });
}
