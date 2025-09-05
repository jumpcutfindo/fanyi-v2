import { Files, Images } from 'lucide-react';
import { toast } from 'sonner';

import { OcrResult } from '@shared/types/ocr';
import { Button } from '@renderer/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { imageBase64ToBlob } from '@renderer/utils/image.util';

interface TranslationImageProps {
  ocrResult: OcrResult;
  screenshot: string;
}

export function TranslationImage({
  ocrResult,
  screenshot,
}: TranslationImageProps) {
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
    <div className="flex h-full w-full flex-col items-center justify-center bg-black/20">
      <div className="flex h-0 grow">
        <img
          src={screenshot}
          className="max-h-full max-w-full object-scale-down"
        />
      </div>
      <div className="flex flex-row items-center gap-2 p-2">
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
