import { ScreenshotPreset } from '@shared/types/screenshot';
import { AppWindow, Monitor, Pencil, Plus } from 'lucide-react';

import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
} from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
import { useGetScreenshotPresets } from '@renderer/features/screenshot/queries/getScreenshotPresets.query';
import { cn } from '@renderer/lib/utils';
import { usePresetStore } from '@renderer/stores/usePresetStore';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';

export function PresetManager() {
  const { data: presets } = useGetScreenshotPresets();

  const activePreset = usePresetStore((state) => state.activePreset);
  const setActivePreset = usePresetStore((state) => state.setActivePreset);

  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  return (
    <SidebarContainer>
      <SidebarHeader title="Presets">
        <Button
          variant="ghost"
          type="button"
          className="size-6 rounded-full"
          onClick={() =>
            setSidebarState({
              state: 'editor',
              options: { mode: 'create' },
            })
          }
        >
          <Plus className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {presets?.map((p) => (
          <PresetItem
            key={p.id}
            preset={p}
            isActive={p === activePreset}
            handleSelect={() => setActivePreset(p)}
            handleEdit={() =>
              setSidebarState({
                state: 'editor',
                options: { mode: 'edit', initialPreset: p },
              })
            }
          />
        ))}
      </SidebarContent>
    </SidebarContainer>
  );
}

interface PresetItemProps {
  preset: ScreenshotPreset | null;
  isActive: boolean;
  handleSelect: () => void;
  handleEdit: () => void;
}

function PresetItem({
  preset,
  handleSelect,
  handleEdit,
  isActive,
}: PresetItemProps) {
  if (!preset) return null;

  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          'hover:bg-muted flex w-full flex-col gap-2 rounded-sm border p-2 hover:cursor-pointer',
          isActive ? 'border-primary' : ''
        )}
        onClick={handleSelect}
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
      <button
        className="text-muted-foreground hover:bg-muted absolute top-2 right-2 rounded-sm p-2 opacity-0 group-hover:opacity-100 hover:cursor-pointer focus:opacity-100"
        onClick={handleEdit}
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}
