import { Loader2Icon, Pencil, Play } from 'lucide-react';

import { useGetOcrStatusQuery } from '@renderer/features/ocr/queries/getOcrStatus.query';
import { useGetScreenshotWithPreset } from '@renderer/features/screenshot/queries/getScreenshotWithPreset.query';
import { cn } from '@renderer/lib/utils';
import { useSidebarStore } from '@renderer/stores/useSidebarStore';
import { PreviewTab, useTabStore } from '@renderer/stores/useTabStore';

interface PreviewTabContentProps {
  tab: PreviewTab;
}

export function PreviewTabContent({ tab }: PreviewTabContentProps) {
  const { activePreset: preset } = tab;

  const { data: screenshot, isPending: isScreenshotPending } =
    useGetScreenshotWithPreset(preset);
  const { data: ocrStatus } = useGetOcrStatusQuery();

  const sidebarState = useSidebarStore((state) => state.sidebarState);
  const setSidebarState = useSidebarStore((state) => state.setSidebarState);

  const addTab = useTabStore((state) => state.addTab);

  const showMetadataAndButtons = sidebarState.state !== 'editor';
  const canRequestOcr = ocrStatus === 'available' && screenshot;

  if (!preset) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {!isScreenshotPending ? (
        <img
          src={screenshot}
          className={cn(
            'max-h-120 w-full bg-black/20 object-scale-down lg:max-h-180'
          )}
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
              className="group flex size-12 cursor-pointer items-center justify-center rounded-full bg-green-200 hover:bg-green-300 disabled:opacity-20"
              onClick={() => {
                if (!canRequestOcr) {
                  return;
                }

                addTab(
                  {
                    id: '',
                    type: 'translation',
                    title: preset.name,
                    preset: preset,
                    screenshot,
                    imageSize: 'small',
                    activeWord: null,
                  },
                  { setActive: true }
                );
              }}
              disabled={!canRequestOcr}
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
