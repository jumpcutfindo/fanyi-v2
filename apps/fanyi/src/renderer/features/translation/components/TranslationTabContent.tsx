import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { TranslationImage } from './TranslationImage';

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

  const [isTranslationsHidden, setIsTranslationsHidden] = useState(false);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isOcrTextPending ? (
        <div className="flex flex-col items-center gap-8">
          <img
            src={screenshot}
            className={cn(
              'max-h-120 w-full bg-black/20 object-scale-down lg:max-h-180'
            )}
          />
          <Loader2Icon className="animate-spin" />
          <span>Reading and translating image...</span>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col">
          <TranslationImage
            ocrResult={ocrResponse.ocrResult}
            screenshot={screenshot}
            setTranslationsHidden={setIsTranslationsHidden}
          />
          {!isTranslationsHidden ? (
            <TranslationList
              ocrResult={ocrResponse.ocrResult}
              translations={ocrResponse.translations}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
