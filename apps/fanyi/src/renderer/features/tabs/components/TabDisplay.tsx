import { ScreenshotPreset } from '@shared/types/screenshot';
import { Pencil, Play } from 'lucide-react';

import { useGetScreenshotWithPreset } from '@renderer/features/screenshot/queries/getScreenshotWithPreset.query';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { useTabStore } from '@renderer/stores/useTabStore';

const containerStyle = 'flex grow items-center justify-center';

export function TabDisplay() {
  const activeTab = useTabStore((state) => state.activeTab);
  const previewTab = useTabStore((state) => state.previewTab);

  if (!activeTab) {
    return (
      <div className={containerStyle}>
        <span className="text-muted-foreground text-center italic">
          No tab selected
        </span>
      </div>
    );
  }

  if (activeTab.type === 'preview' && previewTab) {
    return <PreviewTabDisplay preset={previewTab.activePreset} />;
  }

  return (
    <div className={containerStyle}>
      {activeTab.title} ({activeTab.id}) selected
    </div>
  );
}

interface PreviewTabDisplayProps {
  preset: ScreenshotPreset;
}

function PreviewTabDisplay({ preset }: PreviewTabDisplayProps) {
  const { data: screenshot } = useGetScreenshotWithPreset(preset);

  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <img
        src={screenshot}
        className="h-120 w-full bg-black/20 object-scale-down"
      />
      <div className="text-center">
        <h1 className="text-lg font-semibold">{preset.name}</h1>
        <span>
          {preset.options.crop?.width}x{preset.options.crop?.height}
        </span>
      </div>
      <div className="flex grow flex-row items-center justify-center gap-8 px-32">
        <button className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-green-100">
          <Play className="text-green-500" />
        </button>
        <button
          className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-amber-100"
          onClick={() =>
            setSidebarState({
              state: 'editor',
              options: { mode: 'edit', initialPreset: preset },
            })
          }
        >
          <Pencil className="text-amber-500" />
        </button>
      </div>
    </div>
  );
}
