import { z } from 'zod';

const rawDictionaryEntrySchema = z.object({
  simplified: z.string(),
  traditional: z.string(),
  pinyin: z.string(),
  definition: z.string(),
});

export const storedDictionarySchema = z.object({
  id: z.string(),
  name: z.string(),
  rawEntries: z.array(rawDictionaryEntrySchema),
  url: z.string().optional(),
  createdOn: z.date(),
  modifiedOn: z.date(),
});

export type Dictionary = z.infer<typeof storedDictionarySchema> & {
  // Keep the post-processed version out of the base schema
  wordMap: Record<string, DictionaryEntry>;
};

export type DictionaryMinimal = Omit<Dictionary, 'wordMap' | 'rawEntries'> & {
  wordCount: number;
};

/**
 * Represents a dictionary entry when parsed from the CEDICT dictionary
 */
export type RawDictionaryEntry = z.infer<typeof rawDictionaryEntrySchema>;

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

export type CreateDictionaryPayload = Omit<
  Dictionary,
  'id' | 'createdOn' | 'modifiedOn'
>;
