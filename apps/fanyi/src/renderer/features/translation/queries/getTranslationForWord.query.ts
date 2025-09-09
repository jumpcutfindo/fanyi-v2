import { useQuery } from '@tanstack/react-query';

import { DictionaryEntry } from '@shared/types/dictionary';

export function useGetDictionaryEntryForWordQuery(word: string) {
  return useQuery<DictionaryEntry | null>({
    queryKey: ['get-dictionary-entry-for-word', word],
    queryFn: () => window.api.getDictionaryEntryOfWord(word),
  });
}
