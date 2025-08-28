import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';

import { useGetOcrWithPresetQuery } from '@renderer/features/screenshot/queries/getOcrWithPreset.query';
import { TranslationImage } from '@renderer/features/translation/components/TranslationImage';
import { TranslationList } from '@renderer/features/translation/components/TranslationList';
import { cn } from '@renderer/lib/utils';
import { TranslationTab, useTabStore } from '@renderer/stores/useTabStore';

interface TranslationTabContentProps {
  tab: TranslationTab;
}

export function TranslationTabContent({ tab }: TranslationTabContentProps) {
  const { updateTab } = useTabStore();
  const { id, preset, screenshot, activeWord, imageSize } = tab;

  const setActiveWord = (word: string) => {
    updateTab({
      ...tab,
      activeWord: word,
    });
  };

  const setImageSize = (size: typeof imageSize) => {
    updateTab({
      ...tab,
      preset: {
        ...preset,
      },
      imageSize: size,
    });
  };

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
            screenshot={screenshot}
            setTranslationsHidden={setIsTranslationsHidden}
            imageSize={imageSize}
            setImageSize={setImageSize}
          />
          {!isTranslationsHidden ? (
            <TranslationList
              ocrResult={ocrResponse.ocrResult}
              translations={ocrResponse.translations}
              activeWord={activeWord}
              setActiveWord={setActiveWord}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
