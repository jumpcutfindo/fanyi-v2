export interface Dictionary {
  id: string;
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
  definitions: {
    definition: string;
    links: {
      word: string;
      start: number;
    }[];
  }[];
}
