import { useQuery } from '@tanstack/react-query';

import { DictionarySearchOptions } from '@shared/types/dictionary';

export function useSearchDictionaries(
  queryString: string,
  options: DictionarySearchOptions
) {
  return useQuery({
    queryKey: [
      'search-dictionaries',
      options.space,
      options.space === 'specific' ? options.dictionaryId : '',
      queryString,
    ],
    queryFn: () => window.api.searchDictionaries(queryString, options),
  });
}
