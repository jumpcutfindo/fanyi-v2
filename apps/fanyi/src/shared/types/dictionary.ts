export interface Dictionary {
  name: string;
  wordMap: Record<string, DictionaryEntry>;
  url?: string;
  createdOn: Date;
  modifiedOn: Date;
}

export type DictionaryMinimal = Omit<Dictionary, 'wordMap'> & {
  wordCount: number;
};

export interface DictionaryEntry {
  traditional: string;
  simplified: string;
  pinyin: string;
  defintions: {
    definition: string;
    links: {
      word: string;
      start: number;
    }[];
  }[];
}
