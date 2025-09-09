export interface Dictionary {
  wordMap: Record<string, DictionaryEntry>;
}

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
