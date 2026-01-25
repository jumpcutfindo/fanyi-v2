import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { DictionarySearchOptions } from '@shared/types/dictionary';

export function useSearchDictionaries(
  queryString: string,
  options: DictionarySearchOptions
) {
  return useInfiniteQuery({
    queryKey: [
      'search-dictionaries',
      queryString,
      options.space,
      options.space === 'specific' ? options.dictionaryId : '',
    ],
    queryFn: ({ pageParam = 0 }) =>
      window.api.searchDictionaries(queryString, {
        ...options,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === options.limit
        ? allPages.length * options.limit
        : undefined;
    },
    initialPageParam: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
