import { Loader2Icon } from 'lucide-react';

import { useGetOcrWithPresetQuery } from '@renderer/features/screenshot/queries/getOcrWithPreset.query';
import { TranslationList } from '@renderer/features/translation/components/TranslationList';
import { cn } from '@renderer/lib/utils';
import { TranslationTab } from '@renderer/stores/useTabStore';

interface TranslationTabDisplayProps {
  tab: TranslationTab;
}

export function TranslationTabDisplay({ tab }: TranslationTabDisplayProps) {
  const { id, preset, screenshot } = tab;

  const { data: ocrText, isPending: isOcrTextPending } =
    useGetOcrWithPresetQuery(id, preset);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
      {isOcrTextPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          <img
            src={screenshot}
            className={cn('h-120 w-full bg-black/20 object-scale-down')}
          />
          <TranslationList translations={ocrText?.translations.join(', ')} />
        </>
      )}
    </div>
  );
}
