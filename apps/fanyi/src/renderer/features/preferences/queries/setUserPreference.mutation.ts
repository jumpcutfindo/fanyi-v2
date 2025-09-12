import { useMutation } from '@tanstack/react-query';

import { UserPreferences } from '@shared/types/preferences';

export function useSetUserPreferenceMutation() {
  return useMutation({
    mutationKey: ['set-user-preference'],
    mutationFn: (payload: {
      key: keyof UserPreferences;
      value: UserPreferences[keyof UserPreferences];
    }) => window.api.setPreference(payload.key, payload.value),
  });
}
