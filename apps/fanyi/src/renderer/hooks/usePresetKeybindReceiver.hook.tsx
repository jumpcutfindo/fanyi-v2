import { IpcRendererEvent } from 'electron';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useGetOcrStatusQuery } from '@shared/queries/getOcrStatus.query';
import { useGetScreenshotPresets } from '@renderer/features/screenshot/queries/getScreenshotPresets.query';
import { useTabStore } from '@renderer/stores/useTabStore';
import { bufferToDataUri } from '@renderer/utils/image.util';

export function usePresetKeybindReceiver() {
  const { data: presets } = useGetScreenshotPresets();
  const { data: ocrStatus } = useGetOcrStatusQuery();

  const addTab = useTabStore((state) => state.addTab);

  const presetsRef = useRef(presets);
  const ocrStatusRef = useRef(ocrStatus);

  // Update the refs whenever presets or ocrStatus change
  useEffect(() => {
    presetsRef.current = presets;
    ocrStatusRef.current = ocrStatus;
  }, [presets, ocrStatus]);

  // Setup listener to handle events triggered by keybind presses
  useEffect(() => {
    // Define the listener function to be used for both 'on' and 'removeListener'
    const handleScreenshotEvent = (
      _event: IpcRendererEvent,
      presetId: string,
      buffer: Buffer
    ) => {
      if (!ocrStatusRef.current) {
        toast.error('OCR is not ready yet');
      }

      const preset = presetsRef.current?.find((p) => p.id === presetId);
      const screenshot = bufferToDataUri(buffer, 'image/png');

      // Create a new tab for translation
      addTab(
        {
          type: 'translation',
          title: preset.name,
          preset: preset,
          screenshot,
        },
        { setActive: true }
      );
    };

    window.ipcRenderer.on(
      'trigger-screenshot-with-preset',
      handleScreenshotEvent
    );

    return () => {
      window.ipcRenderer.removeAllListeners('trigger-screenshot-with-preset');
    };
  }, []);
}
