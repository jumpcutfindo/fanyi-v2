import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { useTabStore } from '@renderer/stores/useTabStore';
import { blobToImageBase64 } from '@renderer/utils/image.util';

export function usePasteImageReceiver() {
  const addTab = useTabStore((state) => state.addTab);
  const sidebarState = useSidebarStore((state) => state.sidebarState);

  const canProcess = () => sidebarState.state !== 'editor';

  const addImageTab = (
    base64Image: string,
    title: string = 'Pasted Screenshot'
  ) => {
    addTab(
      {
        id: uuidv4(),
        type: 'translation',
        title,
        preset: {
          id: uuidv4(),
          type: 'temporary',
          name: title,
          description: new Date().toLocaleString(),
        },
        screenshot: base64Image,
      },
      { setActive: true }
    );
  };

  const handlePaste = async (event: KeyboardEvent) => {
    // Check for Ctrl + V
    const isPaste = event.key === 'v' && (event.ctrlKey || event.metaKey); // metaKey for macOS

    if (isPaste && canProcess()) {
      event.preventDefault();

      try {
        const clipboardItems = await navigator.clipboard.read();

        for (const clipboardItem of clipboardItems) {
          if (clipboardItem.types.includes('image/png')) {
            const blob = await clipboardItem.getType('image/png');
            const screenshot = await blobToImageBase64(blob);

            addImageTab(screenshot, 'Pasted Screenshot');
          }
        }
      } catch (error) {
        console.error('Failed to read clipboard contents: ', error);
      }
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();

    if (canProcess() && event.dataTransfer?.files) {
      for (const file of Array.from(event.dataTransfer.files)) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();

          reader.onload = (e) => {
            if (e.target?.result) {
              const base64Image = e.target.result as string;
              addImageTab(base64Image, file.name);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  useEffect(() => {
    // Add event listeners
    document.addEventListener('keydown', handlePaste);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', (e) => e.preventDefault()); // This is crucial to allow the drop event

    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handlePaste);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', (e) => e.preventDefault());
    };
  }, []);
}
