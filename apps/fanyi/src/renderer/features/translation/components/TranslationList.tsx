import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResult } from '@shared/types/ocr';

import { Button } from '@renderer/components/ui/Button';

interface TranslationListProps {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

export function TranslationList({
  ocrResult,
  translations,
}: TranslationListProps) {
  const uniqueEntries = [...new Set(translations)];

  return (
    <div className="flex h-0 w-full grow flex-row">
      <div className="flex h-full w-60 overflow-auto p-2">
        <div className="flex h-fit flex-row flex-wrap">
          {uniqueEntries.map((t) => (
            <Button
              variant="outline"
              className="flex-1 px-2 py-1 text-lg font-normal"
            >
              {t.simplified}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex grow flex-col items-center gap-2 overflow-auto p-2">
        {uniqueEntries.map((t, index) => (
          <TranslationItem key={`${t.simplified}+${index}`} entry={t} />
        ))}
      </div>
    </div>
  );
}

interface TranslationItemProps {
  entry: DictionaryEntry;
}

function TranslationItem({ entry }: TranslationItemProps) {
  return (
    <div className="bg-card flex w-full flex-col rounded-md border p-4">
      <span className="text-2xl">{entry.simplified}</span>
      <span className="text-sm">{entry.pinyin}</span>
      <div>{entry.definition}</div>
    </div>
  );
}
