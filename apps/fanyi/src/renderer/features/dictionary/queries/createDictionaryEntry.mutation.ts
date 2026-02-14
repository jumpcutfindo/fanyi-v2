import { useMutation } from '@tanstack/react-query';

import { CreateDictionaryEntryPayload } from '@shared/types/dictionary';
import { queryClient } from '@renderer/query';

export function useCreateDictionaryEntryMutation() {
  return useMutation({
    mutationFn: ({
      dictionaryId,
      entry,
    }: {
      dictionaryId: string;
      entry: CreateDictionaryEntryPayload;
    }) => {
      return window.api.createDictionaryEntry(dictionaryId, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['search-dictionaries'] });
    },
  });
}
