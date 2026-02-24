import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryClient } from '@renderer/query';

export function useDeleteDictionaryEntryMutation() {
  return useMutation({
    mutationFn: ({
      dictionaryId,
      entryId,
    }: {
      dictionaryId: string;
      entryId: string;
    }) => window.api.deleteDictionaryEntry(dictionaryId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['search-dictionaries'] });

      toast.success(`Dictionary entry deleted successfully`);
    },
  });
}
