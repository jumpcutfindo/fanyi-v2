import { useQuery } from '@tanstack/react-query';

export function useSearchDictionaries(queryString: string) {
  return useQuery({
    queryKey: ['search-dictionaries', queryString],
    queryFn: () => window.api.searchDictionaries(queryString),
  });
}
