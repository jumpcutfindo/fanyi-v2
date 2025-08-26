import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResult } from '@shared/types/ocr';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@renderer/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@renderer/components/ui/Tooltip';
import { cn } from '@renderer/lib/utils';

const highlightClass = ['border-primary', 'bg-primary/10'];

interface TranslationListProps {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

export function TranslationList({
  ocrResult,
  translations,
}: TranslationListProps) {
  const translationItemsContainerRef = useRef<HTMLDivElement>(null);
  const wordToTranslationRef = useRef<Record<string, HTMLDivElement>>({});

  const [activeWord, setActiveWord] = useState<string | null>(null);
  const isObserverDisabled = useRef<boolean>(false);

  const uniqueEntries = useMemo(
    () => [...new Set(translations)],
    [translations]
  );

  const scrollToEntry = (word: string) => {
    const element = wordToTranslationRef.current[word];

    if (element) {
      // Set active word and prevent observer from interfering
      setActiveWord(word);
      isObserverDisabled.current = true;

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      requestAnimationFrame(() => {
        // Add highlight to element
        element.classList.add(...highlightClass);

        // Remove after some delay
        setTimeout(() => {
          element.classList.remove(...highlightClass);
          isObserverDisabled.current = false;
        }, 1500);
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isObserverDisabled.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the corresponding word from our uniqueEntries
            const intersectingWord = uniqueEntries.find(
              (t) => wordToTranslationRef.current[t.simplified] === entry.target
            );
            if (intersectingWord) {
              setActiveWord(intersectingWord.simplified);
            }
          }
        });
      },
      {
        root: translationItemsContainerRef.current,
        rootMargin: '-45% 0px -45% 0px', // Margin in the centre
        threshold: 0,
      }
    );

    // Observe each translation item
    Object.values(wordToTranslationRef.current).forEach((el) => {
      observer.observe(el);
    });

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [uniqueEntries]);

  return (
    <div className="flex h-0 w-full grow flex-row">
      <div className="flex h-full w-60 overflow-auto p-2">
        <div className="flex h-fit flex-row flex-wrap">
          {uniqueEntries.map((t) => (
            <Tooltip key={t.simplified}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 px-2 py-1 text-lg font-normal',
                    activeWord === t.simplified ? 'border-primary' : ''
                  )}
                  onClick={() => scrollToEntry(t.simplified)}
                >
                  {t.simplified}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.pinyin}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      <div
        ref={translationItemsContainerRef}
        className="flex grow flex-col items-center gap-2 overflow-auto p-2"
      >
        {uniqueEntries.map((t, index) => (
          <TranslationItem
            ref={(ref) => {
              if (ref) {
                wordToTranslationRef.current[t.simplified] = ref;
              }
            }}
            key={`${t.simplified}+${index}`}
            entry={t}
          />
        ))}
      </div>
    </div>
  );
}

interface TranslationItemProps {
  ref?: React.Ref<HTMLDivElement>;
  entry: DictionaryEntry;
}

function TranslationItem({ ref, entry }: TranslationItemProps) {
  return (
    <div
      ref={ref}
      className="bg-card flex w-full flex-col rounded-md border p-4 transition-all"
    >
      <span className="text-2xl">{entry.simplified}</span>
      <span className="text-sm">{entry.pinyin}</span>
      <div>{entry.definition}</div>
    </div>
  );
}
