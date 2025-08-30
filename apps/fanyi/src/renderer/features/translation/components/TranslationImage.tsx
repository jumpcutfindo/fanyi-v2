import { OcrResult } from '@shared/types/ocr';
import { Ban, Files, Image, Images, ImageUpscale } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@renderer/components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@renderer/components/ui/Tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { cn } from '@renderer/lib/utils';
import { imageBase64ToBlob } from '@renderer/utils/image.util';

type ImageSize = 'none' | 'small' | 'medium' | 'large' | 'full';

interface TranslationImageProps {
  ocrResult: OcrResult;
  screenshot: string;
  setTranslationsHidden: (hidden: boolean) => void;
}

export function TranslationImage({
  ocrResult,
  screenshot,
  setTranslationsHidden,
}: TranslationImageProps) {
  const [imageSize, setImageSize] = useState<ImageSize>('small');

  const handleSetImage = (size: ImageSize) => {
    switch (size) {
      case 'full':
        setTranslationsHidden(true);
        break;
      default:
        setTranslationsHidden(false);
        break;
    }

    setImageSize(size);
  };

  const getImageSizeClass = () => {
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
        return 'h-[90vh]';
    }
  };

  const handleCopyText = () => {
    navigator.clipboard
      .writeText(ocrResult.results.map((r) => r.text).join(''))
      .then(() => {
        toast.success('Text copied to clipboard');
      });
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
          onValueChange={(value) => handleSetImage(value as ImageSize)}
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" onClick={handleCopyImage} type="button">
              <Images />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy image</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" onClick={handleCopyText} type="button">
              <Files />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy read text</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
