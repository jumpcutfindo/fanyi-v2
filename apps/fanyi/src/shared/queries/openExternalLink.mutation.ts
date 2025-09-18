import { useMutation } from '@tanstack/react-query';

function useOpenExternalLinkMutation() {
  return useMutation({
    mutationFn: (url: string) => {
      return window.api.openExternalLink(url);
    },
  });
}

export { useOpenExternalLinkMutation };
