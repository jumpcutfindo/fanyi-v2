import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UserPreferences } from '@shared/types/preferences';

export function useSetUserPreferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['set-user-preference'],
    mutationFn: async (payload: {
      key: keyof UserPreferences;
      value: UserPreferences[keyof UserPreferences];
    }) => {
      window.api.setPreference(payload.key, payload.value);
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
}
