import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@renderer/query';

export function useDeleteDictionaryMutation() {
  return useMutation({
    mutationFn: (id: string) => window.api.deleteDictionary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['search-dictionaries'] });
    },
  });
}
