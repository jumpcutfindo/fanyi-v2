import { useQuery } from '@tanstack/react-query';

export function useGetUsedKeybindsQuery() {
  return useQuery({
    queryKey: ['used-keybinds'],
    queryFn: () => window.api.getUsedKeybinds(),
  });
}
