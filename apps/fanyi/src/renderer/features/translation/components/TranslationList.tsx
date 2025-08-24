interface TranslationListProps {
  translations?: string;
}

export function TranslationList({ translations }: TranslationListProps) {
  return <div>This is the translations: {translations}</div>;
}
