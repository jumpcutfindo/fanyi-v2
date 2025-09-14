import { useQuery } from '@tanstack/react-query';

import { DictionaryEntry } from '@shared/types/dictionary';

export function useGetDictionaryEntryForWordQuery(word: string) {
  return useQuery<{ result: DictionaryEntry }>({
    queryKey: ['get-dictionary-entry-for-word', word],
    queryFn: async () => {
      return { result: await window.api.getDictionaryEntryOfWord(word) };
    },
  });
}
