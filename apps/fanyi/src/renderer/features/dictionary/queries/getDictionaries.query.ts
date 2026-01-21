import { useQuery } from '@tanstack/react-query';

export function useGetDictionaries() {
  return useQuery({
    queryKey: ['dictionaries'],
    queryFn: () => window.api.getDictionaries(),
  });
}
