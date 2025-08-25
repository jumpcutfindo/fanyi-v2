import { Loader2Icon } from 'lucide-react';

import { useGetOcrWithPresetQuery } from '@renderer/features/screenshot/queries/getOcrWithPreset.query';
import { TranslationList } from '@renderer/features/translation/components/TranslationList';
import { cn } from '@renderer/lib/utils';
import { TranslationTab } from '@renderer/stores/useTabStore';

interface TranslationTabContentProps {
  tab: TranslationTab;
}

export function TranslationTabContent({ tab }: TranslationTabContentProps) {
  const { id, preset, screenshot } = tab;

  const { data: ocrResponse, isPending: isOcrTextPending } =
    useGetOcrWithPresetQuery(id, preset);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isOcrTextPending ? (
        <div className="flex flex-col items-center gap-8">
          <img
            src={screenshot}
            className={cn('h-120 w-full bg-black/20 object-scale-down')}
          />
          <Loader2Icon className="animate-spin" />
          <span>Reading and translating image...</span>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col">
          <img
            src={screenshot}
            className={cn('h-40 w-full bg-black/20 object-scale-down')}
          />
          <TranslationList
            ocrResult={ocrResponse.ocrResult}
            translations={ocrResponse.translations}
          />
        </div>
      )}
    </div>
  );
}
