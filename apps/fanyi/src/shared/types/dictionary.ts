export interface Dictionary {
  id: string;
  name: string;
  wordMap: Record<string, DictionaryEntry>;
  rawEntries: RawDictionaryEntry[];
  url?: string;
  createdOn: Date;
  modifiedOn: Date;
}

export type DictionaryMinimal = Omit<Dictionary, 'wordMap' | 'rawEntries'> & {
  wordCount: number;
};

/**
 * Represents a dictionary entry when parsed from the CEDICT dictionary
 */
export interface RawDictionaryEntry {
  simplified: string;
  traditional: string;
  pinyin: string;
  definition: string;
}

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
