import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateDictionaryPayload } from '@shared/types/dictionary';

export function useUpdateDictionaryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dictionary: UpdateDictionaryPayload) => {
      return window.api.updateDictionary(dictionary);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}
