import { DictionaryEntry } from '@shared/types/dictionary';
import { useQuery } from '@tanstack/react-query';

export function useGetDictionaryEntryForWordQuery(word: string) {
  return useQuery<{ result: DictionaryEntry }>({
    queryKey: ['get-dictionary-entry-for-word', word],
    queryFn: async () => {
      return { result: await window.api.getDictionaryEntryOfWord(word) };
    },
  });
}
