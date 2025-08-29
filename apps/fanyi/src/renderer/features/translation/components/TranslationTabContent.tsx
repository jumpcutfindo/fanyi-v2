import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';

import { useGetOcrWithPresetQuery } from '@renderer/features/screenshot/queries/getOcrWithPreset.query';
import { TranslationList } from '@renderer/features/translation/components/TranslationList';
import { cn } from '@renderer/lib/utils';
import { TranslationTab } from '@renderer/stores/useTabStore';

import { TranslationImage } from './TranslationImage';

interface TranslationTabContentProps {
  tab: TranslationTab;
}

export function TranslationTabContent({ tab }: TranslationTabContentProps) {
  const { id, preset, screenshot } = tab;

  const { data: ocrResponse, isPending: isOcrTextPending } =
    useGetOcrWithPresetQuery(id, preset);

  const [isTranslationsHidden, setIsTranslationsHidden] = useState(false);

  console.log('TranslationTabContent');

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
