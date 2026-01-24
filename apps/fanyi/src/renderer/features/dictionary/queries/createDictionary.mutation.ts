import { useMutation } from '@tanstack/react-query';

import { CreateDictionaryPayload } from '@shared/types/dictionary';
import { queryClient } from '@renderer/query';

export function useCreateDictionaryMutation() {
  return useMutation({
    mutationFn: (dictionary: CreateDictionaryPayload) => {
      return window.api.createDictionary(dictionary);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}
