import { useMutation } from '@tanstack/react-query';

import { CreateDictionaryPayload } from '@shared/types/dictionary';

export function useCreateDictionaryMutation() {
  return useMutation({
    mutationFn: (dictionary: CreateDictionaryPayload) => {
      return window.api.createDictionary(dictionary);
    },
  });
}
