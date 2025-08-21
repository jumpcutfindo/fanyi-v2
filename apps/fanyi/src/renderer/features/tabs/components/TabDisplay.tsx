import { ScreenshotPreset } from '@shared/types/screenshot';
import { Loader2Icon, Pencil, Play } from 'lucide-react';

import { useGetScreenshotWithPreset } from '@renderer/features/screenshot/queries/getScreenshotWithPreset.query';
import { cn } from '@renderer/lib/utils';
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
    if (!previewTab.activePreset) return null;

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
  const { data: screenshot, isPending: isScreenshotPending } =
    useGetScreenshotWithPreset(preset);

  const sidebarState = useSidebarStore((state) => state.sidebarState);
  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  const addTab = useTabStore((state) => state.addTab);

  const showMetadataAndButtons = sidebarState.state !== 'editor';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
      {!isScreenshotPending ? (
        <img
          src={screenshot}
          className={cn('h-120 w-full bg-black/20 object-scale-down')}
        />
      ) : (
        <Loader2Icon className="animate-spin" />
      )}
      {showMetadataAndButtons ? (
        <>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{preset.name}</h1>
            <span>
              {preset.options.crop?.width}x{preset.options.crop?.height}
            </span>
          </div>
          <div className="flex grow flex-row items-center justify-center gap-8 px-32">
            <button
              className="group flex size-12 cursor-pointer items-center justify-center rounded-full bg-green-200 hover:bg-green-300"
              onClick={() =>
                addTab(
                  {
                    id: '',
                    type: 'translation',
                    preset: preset,
                    title: preset.name,
                  },
                  { setActive: true }
                )
              }
            >
              <Play className="text-green-600 group-hover:fill-green-600" />
            </button>
            <button
              className="group flex size-12 cursor-pointer items-center justify-center rounded-full bg-amber-200 hover:bg-amber-300"
              onClick={() =>
                setSidebarState({
                  state: 'editor',
                  options: { mode: 'edit', initialPreset: preset },
                })
              }
            >
              <Pencil className="text-amber-600 group-hover:fill-amber-600" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
