import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { useTabStore } from '@renderer/stores/useTabStore';
import { blobToImageBase64, pngToBuffer } from '@renderer/utils/image.util';

export function usePasteImageReceiver() {
  const addTab = useTabStore((state) => state.addTab);
  const sidebarState = useSidebarStore((state) => state.sidebarState);

  const handlePaste = async (event: KeyboardEvent) => {
    // Check for Ctrl + V
    const isPaste = event.key === 'v' && (event.ctrlKey || event.metaKey); // metaKey for macOS

    // Check if can continue with action
    const canProcess = isPaste && sidebarState.state !== 'editor';

    if (canProcess) {
      // Prevent the default paste behavior
      event.preventDefault();

      try {
        const clipboardItems = await navigator.clipboard.read();

        for (const clipboardItem of clipboardItems) {
          if (clipboardItem.types.includes('image/png')) {
            const blob = await clipboardItem.getType('image/png');
            const screenshot = await blobToImageBase64(blob);

            // Create a new tab for translation
            addTab(
              {
                id: uuidv4(),
                type: 'translation',
                title: 'Pasted Screenshot',
                preset: {
                  id: uuidv4(),
                  name: 'Pasted Screenshot',
                  description: new Date().toLocaleString(),
                },
                screenshot,
              },
              { setActive: true }
            );
          }
        }
      } catch (error) {
        console.error('Failed to read clipboard contents: ', error);
      }
    }
  };

  useEffect(() => {
    // Add the event listener to the document
    document.addEventListener('keydown', handlePaste);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handlePaste);
    };
  }, []); // The empty dependency array ensures this effect runs only once
}
