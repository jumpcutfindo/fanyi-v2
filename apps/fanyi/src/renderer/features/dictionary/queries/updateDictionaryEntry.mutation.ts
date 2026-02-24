import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CreateDictionaryEntryPayload } from '@shared/types/dictionary';
import { queryClient } from '@renderer/query';

export function useUpdateDictionaryEntryMutation() {
  return useMutation({
    mutationFn: async ({
      dictionaryId,
      entryId,
      entry,
    }: {
      dictionaryId: string;
      entryId: string;
      entry: CreateDictionaryEntryPayload;
    }) => {
      const result = await window.api.updateDictionaryEntry(
        dictionaryId,
        entryId,
        entry
      );

      if (result.status === 'duplicate') {
        throw new Error('Dictionary entry already exists');
      } else if (result.status === 'error') {
        throw new Error('Failed to update dictionary entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['search-dictionaries'] });

      toast.success(`Dictionary entry updated successfully`);
    },
  });
}
