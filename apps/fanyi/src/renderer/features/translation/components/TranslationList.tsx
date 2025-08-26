import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResult } from '@shared/types/ocr';
import { useRef } from 'react';

import { Button } from '@renderer/components/ui/Button';

const highlightClass = ['border-primary', 'bg-primary/10'];

interface TranslationListProps {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

export function TranslationList({
  ocrResult,
  translations,
}: TranslationListProps) {
  const wordToTranslationRef = useRef<Record<string, HTMLDivElement>>({});

  const uniqueEntries = [...new Set(translations)];

  const scrollToEntry = (word: string) => {
    const element = wordToTranslationRef.current[word];

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      requestAnimationFrame(() => {
        // Add highlight to element
        element.classList.add(...highlightClass);

        // Remove after 1 second
        setTimeout(() => {
          element.classList.remove(...highlightClass);
        }, 1500);
      });
    }
  };

  return (
    <div className="flex h-0 w-full grow flex-row">
      <div className="flex h-full w-60 overflow-auto p-2">
        <div className="flex h-fit flex-row flex-wrap">
          {uniqueEntries.map((t) => (
            <Button
              key={t.simplified}
              variant="outline"
              className="flex-1 px-2 py-1 text-lg font-normal"
              onClick={() => scrollToEntry(t.simplified)}
            >
              {t.simplified}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex grow flex-col items-center gap-2 overflow-auto p-2">
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
