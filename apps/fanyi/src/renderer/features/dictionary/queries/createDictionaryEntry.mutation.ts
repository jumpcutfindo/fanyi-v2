import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CreateDictionaryEntryPayload } from '@shared/types/dictionary';
import { queryClient } from '@renderer/query';

export function useCreateDictionaryEntryMutation() {
  return useMutation({
    mutationFn: async ({
      dictionaryId,
      entry,
    }: {
      dictionaryId: string;
      entry: CreateDictionaryEntryPayload;
    }) => {
      const result = await window.api.createDictionaryEntry(
        dictionaryId,
        entry
      );

      if (result.status === 'duplicate') {
        throw new Error('Dictionary entry already exists');
      } else if (result.status === 'error') {
        throw new Error('Failed to create dictionary entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['search-dictionaries'] });
    },
  });
}
