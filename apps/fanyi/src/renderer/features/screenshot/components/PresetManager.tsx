import { ScreenshotPreset } from '@shared/types/screenshot';
import { AppWindow, Monitor } from 'lucide-react';
import { useState } from 'react';

import { useGetScreenshotPresets } from '@renderer/features/screenshot/queries/getScreenshotPresets.query';
import { cn } from '@renderer/lib/utils';

export function PresetManager() {
  const { data: presets } = useGetScreenshotPresets();

  const [activePreset, setActivePreset] = useState<ScreenshotPreset | null>(
    null
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-sm font-bold">Presets</h1>
      <div className="flex flex-col gap-2">
        {presets?.map((p) => (
          <PresetItem
            preset={p}
            isActive={p === activePreset}
            handleSelect={setActivePreset}
          />
        ))}
      </div>
    </div>
  );
}

interface PresetItemProps {
  preset: ScreenshotPreset | null;
  isActive: boolean;
  handleSelect: (preset: ScreenshotPreset) => void;
}

function PresetItem({ preset, handleSelect, isActive }: PresetItemProps) {
  if (!preset) return null;

  return (
    <button
      type="button"
      className={cn(
        'hover:bg-muted flex flex-col gap-2 rounded-sm border p-2 hover:cursor-pointer',
        isActive ? 'border-primary' : ''
      )}
      onClick={() => handleSelect(preset)}
    >
      <span className="text-sm">{preset.name}</span>
      <span className="text-muted-foreground flex flex-row items-center gap-2 text-xs">
        {preset.options.type === 'screen' ? (
          <Monitor className="size-4" />
        ) : (
          <AppWindow className="size-4" />
        )}{' '}
        <span>{`${preset.options.type === 'screen' ? 'Screen' : 'Window'} (${preset.options.crop?.width}×${preset.options.crop?.height})`}</span>
      </span>
    </button>
  );
}
