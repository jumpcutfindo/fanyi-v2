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
    <div className="flex grow flex-col overflow-auto">
      {translations.map((t) => (
        <div key={t.simplified}>
          <span>{t.simplified}</span>
          <span>{t.definition}</span>
        </div>
      ))}
    </div>
  );
}
