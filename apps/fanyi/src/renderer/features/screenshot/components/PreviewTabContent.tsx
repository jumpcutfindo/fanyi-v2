import { Loader2Icon, Pencil, Play } from 'lucide-react';

import { Button } from '@renderer/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { useGetOcrStatusQuery } from '@renderer/features/ocr/queries/getOcrStatus.query';
import { PresetKeybindDisplay } from '@renderer/features/screenshot/components/PresetKeybindDisplay';
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
    <div className="relative flex h-full w-full flex-col items-center gap-8">
      <div className="flex h-0 grow">
        {!isScreenshotPending ? (
          <img
            src={screenshot}
            className={cn('w-full bg-black/20 object-scale-down')}
          />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </div>
      {showMetadataAndButtons ? (
        <div className="bg-muted absolute bottom-0 mb-16 flex flex-col gap-4 rounded-xl border p-4 shadow-lg">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">{preset.name}</h1>
              {preset.description ? (
                <span className="text-muted-foreground text-sm">
                  {preset.description}
                </span>
              ) : null}
            </div>

            <span>
              {preset.options.type === 'screen' ? 'Screen' : 'Window'}
              {' • '}
              {preset.options.crop?.width}x{preset.options.crop?.height}
            </span>

            <PresetKeybindDisplay keybind={preset.keybind} />
          </div>
          <div className="flex grow flex-row items-center justify-center gap-4 px-32">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="group border border-emerald-600 shadow-none hover:bg-emerald-600"
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
                      },
                      { setActive: true }
                    );
                  }}
                  disabled={!canRequestOcr}
                  type="button"
                >
                  <Play className="group-hover:text-primary-foreground group-hover:fill-primary-foreground fill-emerald-600 text-emerald-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Execute OCR</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="group border border-amber-600 shadow-none hover:bg-amber-600"
                  onClick={() =>
                    setSidebarState({
                      state: 'editor',
                      options: { mode: 'edit', initialPreset: preset },
                    })
                  }
                  disabled={!canRequestOcr}
                  type="button"
                >
                  <Pencil className="group-hover:text-primary-foreground text-amber-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit preset</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : null}
    </div>
  );
}
