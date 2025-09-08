import { AppWindow, Monitor, Plus } from 'lucide-react';

import { CustomScreenshotPreset } from '@shared/types/screenshot';
import {
  SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@renderer/components/Sidebar';
import { Button } from '@renderer/components/ui/Button';
import { OcrStatus } from '@renderer/features/ocr/components/OcrStatus';
import { useGetOcrStatusQuery } from '@renderer/features/ocr/queries/getOcrStatus.query';
import { useGetScreenshotPresets } from '@renderer/features/screenshot/queries/getScreenshotPresets.query';
import { cn } from '@renderer/lib/utils';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { PreviewTab, useTabStore } from '@renderer/stores/useTabStore';

export function PresetManager() {
  const { data: presets } = useGetScreenshotPresets();
  useGetOcrStatusQuery();

  const previewTab = useTabStore((state) => state.previewTab);
  const setPreviewTab = useTabStore((state) => state.setPreviewTab);

  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  return (
    <SidebarContainer>
      <SidebarHeader title="Presets">
        <Button
          variant="ghost"
          type="button"
          className="size-6 rounded-full"
          onClick={() => {
            setSidebarState({
              state: 'editor',
              options: { mode: 'create' },
            });

            if (!previewTab) {
              const tab: PreviewTab = {
                id: 'new',
                title: 'Preview',
                type: 'preview',
                activePreset: null,
              };

              setPreviewTab(tab, { setActive: true });
            }
          }}
        >
          <Plus className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {presets?.length === 0 && (
          <span className="text-muted-foreground w-full text-center text-sm">
            No presets found
          </span>
        )}

        {presets?.map((p) => (
          <PresetItem
            key={p.id}
            preset={p}
            handleSelect={() => {
              const tab: PreviewTab = {
                id: p.id,
                title: 'Preview',
                type: 'preview',
                activePreset: p,
              };

              setPreviewTab(tab, { setActive: true });
            }}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <OcrStatus />
      </SidebarFooter>
    </SidebarContainer>
  );
}

interface PresetItemProps {
  preset: CustomScreenshotPreset | null;
  isActive?: boolean;
  handleSelect: () => void;
}

function PresetItem({ preset, handleSelect, isActive }: PresetItemProps) {
  if (!preset) return null;

  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          'hover:bg-muted flex w-full flex-col gap-2 rounded-sm border p-2 text-start hover:cursor-pointer',
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
        {preset.keybind ? (
          <span className="flex flex-row gap-1">
            {preset.keybind.split(' + ').map((k) => (
              <span
                key={`${preset.id}-${k}`}
                className="border-muted-foreground text-muted-foreground rounded-sm border px-1 text-xs"
              >
                {k}
              </span>
            ))}
          </span>
        ) : null}
      </button>
    </div>
  );
}
