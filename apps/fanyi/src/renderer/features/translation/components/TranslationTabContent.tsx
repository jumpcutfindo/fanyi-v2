import { Ban, Image, ImageUpscale, Loader2Icon } from 'lucide-react';
import { useState } from 'react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@renderer/components/ui/Tabs';
import { useGetOcrWithPresetQuery } from '@renderer/features/screenshot/queries/getOcrWithPreset.query';
import { TranslationList } from '@renderer/features/translation/components/TranslationList';
import { cn } from '@renderer/lib/utils';
import { TranslationTab, useTabStore } from '@renderer/stores/useTabStore';

interface TranslationTabContentProps {
  tab: TranslationTab;
}

export function TranslationTabContent({ tab }: TranslationTabContentProps) {
  const { updateTab } = useTabStore();
  const { id, preset, screenshot, activeWord } = tab;

  const setActiveWord = (word: string) => {
    updateTab({
      ...tab,
      activeWord: word,
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
          <PreviewImage
            screenshot={screenshot}
            setTranslationsHidden={setIsTranslationsHidden}
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

type ImageSize = 'none' | 'small' | 'medium' | 'large' | 'full';

interface PreviewImageProps {
  screenshot: string;

  setTranslationsHidden: (hidden: boolean) => void;
}

function PreviewImage({
  screenshot,
  setTranslationsHidden,
}: PreviewImageProps) {
  const [imageSize, setImageSize] = useState<ImageSize>('small');

  const getImageSizeClass = () => {
    setTranslationsHidden(false);
    switch (imageSize) {
      case 'none':
        return 'hidden';
      case 'small':
        return 'h-40 lg:h-60';
      case 'medium':
        return 'h-80 lg:h-120';
      case 'large':
        return 'h-120 lg:h-160';
      case 'full':
        setTranslationsHidden(true);
        return 'h-[90vh]';
    }
  };

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 bg-black/20 p-2',
        imageSize === 'full' ? 'h-full' : ''
      )}
    >
      <img
        src={screenshot}
        className={cn('object-scale-down', getImageSizeClass())}
      />
      <Tabs
        className="w-full items-center transition-all"
        value={imageSize}
        onValueChange={(value) => setImageSize(value as ImageSize)}
      >
        <TabsList>
          <TabsTrigger value="none">
            <Ban />
          </TabsTrigger>
          <TabsTrigger value="small">
            <Image className="size-3" />
          </TabsTrigger>
          <TabsTrigger value="medium">
            <Image className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="large">
            <Image className="size-5" />
          </TabsTrigger>
          <TabsTrigger value="full">
            <ImageUpscale className="size-5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
