import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteScreenshotPresetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return window.api.deleteScreenshotPreset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenshot-presets'] });
    },
  });
}
