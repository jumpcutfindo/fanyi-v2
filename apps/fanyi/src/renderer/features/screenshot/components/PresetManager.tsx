import { ScreenshotPreset } from '@shared/types/screenshot';
import { AppWindow, Monitor, Plus } from 'lucide-react';

import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
} from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
import { useGetScreenshotPresets } from '@renderer/features/screenshot/queries/getScreenshotPresets.query';
import { cn } from '@renderer/lib/utils';
import { usePresetStore } from '@renderer/stores/usePresetStore';

export function PresetManager() {
  const { data: presets } = useGetScreenshotPresets();

  const activePreset = usePresetStore((state) => state.activePreset);
  const setActivePreset = usePresetStore((state) => state.setActivePreset);

  return (
    <SidebarContainer>
      <SidebarHeader title="Presets">
        <Button variant="ghost" type="button" className="size-6 rounded-full">
          <Plus className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {presets?.map((p) => (
          <PresetItem
            preset={p}
            isActive={p === activePreset}
            handleSelect={setActivePreset}
          />
        ))}
      </SidebarContent>
    </SidebarContainer>
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
