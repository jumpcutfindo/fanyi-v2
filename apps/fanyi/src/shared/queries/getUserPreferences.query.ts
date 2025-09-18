import { useQuery } from '@tanstack/react-query';

import { UserPreferences } from '@shared/types/preferences';

export function useGetUserPreferences() {
  return useQuery<UserPreferences>({
    queryKey: ['user-preferences'],
    queryFn: () => window.api.getPreferences(),
  });
}
