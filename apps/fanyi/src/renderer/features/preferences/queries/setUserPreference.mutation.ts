import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UserPreferences } from '@shared/types/preferences';

export function useSetUserPreferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['set-user-preference'],
    mutationFn: (payload: {
      key: keyof UserPreferences;
      value: UserPreferences[keyof UserPreferences];
    }) => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      return window.api.setPreference(payload.key, payload.value);
    },
  });
}
