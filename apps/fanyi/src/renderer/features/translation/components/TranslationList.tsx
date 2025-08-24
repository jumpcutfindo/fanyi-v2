import { DictionaryEntry } from '@shared/types/dictionary';
import { OcrResult } from '@shared/types/ocr';

interface TranslationListProps {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

export function TranslationList({
  ocrResult,
  translations,
}: TranslationListProps) {
  return (
    <div className="flex grow flex-col gap-2 overflow-auto py-4">
      {translations.map((t, index) => (
        <TranslationItem key={`${t.simplified}+${index}`} entry={t} />
      ))}
    </div>
  );
}

interface TranslationItemProps {
  entry: DictionaryEntry;
}

function TranslationItem({ entry }: TranslationItemProps) {
  return (
    <div className="bg-card flex w-200 flex-col rounded-md border p-4">
      <span className="text-2xl">{entry.simplified}</span>
      <span className="text-sm">{entry.pinyin}</span>
      <div>{entry.definition}</div>
    </div>
  );
}
