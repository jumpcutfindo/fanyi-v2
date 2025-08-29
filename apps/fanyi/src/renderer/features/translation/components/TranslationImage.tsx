import { Ban, Copy, Image, ImageUpscale } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@renderer/components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@renderer/components/ui/Tabs';
import { cn } from '@renderer/lib/utils';
import { imageBase64ToBlob } from '@renderer/utils/image.util';

type ImageSize = 'none' | 'small' | 'medium' | 'large' | 'full';

interface TranslationImageProps {
  screenshot: string;
  setTranslationsHidden: (hidden: boolean) => void;
}

export function TranslationImage({
  screenshot,
  setTranslationsHidden,
}: TranslationImageProps) {
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

  const handleCopyImage = () => {
    const clipboardItem = new ClipboardItem({
      'image/png': imageBase64ToBlob(screenshot),
    });

    navigator.clipboard.write([clipboardItem]).then(() => {
      toast.success('Image copied to clipboard');
    });
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
      <div className="flex flex-row gap-2">
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
        <Button variant="secondary" onClick={handleCopyImage} type="button">
          <Copy />
        </Button>
      </div>
    </div>
  );
}
