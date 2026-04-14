import { Loader2 } from 'lucide-react';

import { DictionaryEntry } from '@shared/types/dictionary';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@renderer/components/ui/HoverCard';
import { Separator } from '@renderer/components/ui/Separator';
import { useGetDictionaryEntryForWordQuery } from '@renderer/features/translation/queries/getTranslationForWord.query';
import { cn } from '@renderer/lib/utils';

interface DictionaryEntryCardProps {
  entry: DictionaryEntry;
  handleSelect?: (entry: DictionaryEntry) => void;
  isSelected?: boolean;
  ref?: (ref: HTMLButtonElement) => void;
  className?: string;
}

export function DictionaryEntryCard({
  ref,
  entry,
  isSelected,
  handleSelect,
  className,
}: DictionaryEntryCardProps) {
  const renderDefinition = (d: DictionaryEntry['definitions'][number]) => {
    let definitionLine = null;

    if (d.links.length === 0) {
      definitionLine = <span key={d.definition}>{d.definition}</span>;
    } else {
      let lastIndex = 0;
      const chunks = [];

      for (const link of d.links) {
        chunks.push(d.definition.slice(lastIndex, link.start));
        chunks.push(
          <DictionaryHoverCard
            key={`${entry.simplified} + ${link.word}`}
            word={d.definition.slice(link.start, link.start + link.word.length)}
          />
        );
        lastIndex = link.start + link.word.length;
      }

      // Append rest
      if (lastIndex < d.definition.length) {
        chunks.push(d.definition.slice(lastIndex));
      }

      definitionLine = <span>{chunks}</span>;
    }

    return (
      <div key={d.definition} className="flex flex-col">
        <span>{definitionLine}</span>
        {d.dictionaryType === 'custom' ? (
          <span className="text-muted-foreground text-[8pt] italic">
            {d.sourceDictionaryName}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className={cn('pb-1', className)}>
      <button
        type="button"
        ref={ref}
        className={cn(
          'bg-card hover:bg-muted flex h-fit w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-2 text-start transition-all',
          isSelected ? 'border-primary' : ''
        )}
        onClick={() => handleSelect?.(entry)}
      >
        <span className="flex-1 text-2xl">{entry.simplified}</span>
        <span className="text-muted-foreground flex-1 text-sm">
          {entry.pinyin}
        </span>
        <div className="flex flex-3 flex-col gap-2 text-sm">
          {entry.definitions.map((def, index, arr) => (
            <span
              className="flex flex-col gap-2"
              key={`${entry.simplified}-subdef-${index}`}
            >
              {renderDefinition(def)}
              {index !== arr.length - 1 ? <Separator /> : null}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}

interface DictionaryHoverCard {
  word: string;
}

function DictionaryHoverCard({ word }: DictionaryHoverCard) {
  const { data: queryResult, isPending: isEntryLoading } =
    useGetDictionaryEntryForWordQuery(word);

  if (!queryResult || !queryResult.result) {
    return <span>{word}</span>;
  }

  const { result: entry } = queryResult;

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
              {entry?.definitions.map((d, index, arr) => (
                <>
                  <div key={d.definition} className="flex flex-col text-sm">
                    <span>{d.definition}</span>
                    {d.dictionaryType === 'custom' ? (
                      <span className="text-muted-foreground text-[8pt] italic">
                        {d.sourceDictionaryName}
                      </span>
                    ) : null}
                  </div>
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
