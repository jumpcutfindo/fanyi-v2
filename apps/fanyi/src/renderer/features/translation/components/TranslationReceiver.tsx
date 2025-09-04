import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ScreenshotPreset } from '@shared/types/screenshot';
import { useGetOcrStatusQuery } from '@renderer/features/ocr/queries/getOcrStatus.query';
import { useGetScreenshotPresets } from '@renderer/features/screenshot/queries/getScreenshotPresets.query';
import { useTabStore } from '@renderer/stores/useTabStore';
import { bufferToPng } from '@renderer/utils/image.util';

function TranslationReceiver() {
  const { data: presets } = useGetScreenshotPresets();
  const { data: ocrStatus } = useGetOcrStatusQuery();

  const addTab = useTabStore((state) => state.addTab);

  // Setup listener to handle events triggered by keybind presses
  useEffect(() => {
    window.ipcRenderer.on(
      'trigger-screenshot-with-preset',
      (_event, presetId: string, buffer: Buffer) => {
        if (!ocrStatus) {
          toast.error('OCR is not ready yet');
        }

        const preset = presets?.find((p) => p.id === presetId);
        const screenshot = bufferToPng(buffer);

        // Create a new tab for translation
        addTab(
          {
            id: '',
            type: 'translation',
            title: preset.name,
            preset: preset,
            screenshot,
          },
          { setActive: true }
        );
      }
    );
  }, [presets]);

  return <></>;
}

export { TranslationReceiver };
