import { Loader2 } from 'lucide-react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@renderer/components/ui/HoverCard';
import { Separator } from '@renderer/components/ui/Separator';
import { useGetDictionaryEntryForWordQuery } from '@renderer/features/translation/queries/getTranslationForWord.query';

interface TranslationHoverCard {
  word: string;
}

function TranslationHoverCard({ word }: TranslationHoverCard) {
  const { data: entry, isLoading: isEntryLoading } =
    useGetDictionaryEntryForWordQuery(word);

  if (!entry) {
    return <span>{word}</span>;
  }

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger className="text-accent dark:text-primary underline underline-offset-4">
        {word}
      </HoverCardTrigger>
      <HoverCardContent className="flex w-80 flex-col items-center justify-center">
        {!isEntryLoading ? (
          <div className="flex h-full w-full flex-col gap-2">
            <span className="text-xl">{entry?.simplified}</span>
            <span className="text-muted-foreground text-sm">
              {entry?.pinyin}
            </span>

            <div className="flex flex-col gap-2 text-sm">
              {entry?.defintions.map((d, index, arr) => (
                <>
                  <span key={d.definition}>{d.definition}</span>
                  {index !== arr.length - 1 ? <Separator /> : null}
                </>
              ))}
            </div>
          </div>
        ) : (
          <Loader2 className="size-4 animate-spin" />
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export { TranslationHoverCard };
