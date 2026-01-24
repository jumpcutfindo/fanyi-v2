import { z } from 'zod';

const rawDictionaryEntrySchema = z.object({
  simplified: z.string(),
  traditional: z.string(),
  pinyin: z.string(),
  definition: z.string(),
});

export const customDictionarySchema = z.object({
  id: z.string(),
  name: z.string(),
  rawEntries: z.array(rawDictionaryEntrySchema),
  url: z.string().optional(),
  createdOn: z.coerce.date(),
  modifiedOn: z.coerce.date(),
});

export type CustomDictionary = z.infer<typeof customDictionarySchema>;

export type Dictionary = z.infer<typeof customDictionarySchema> & {
  // Keep the post-processed version out of the base schema
  type: 'system' | 'custom';
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
  'id' | 'createdOn' | 'modifiedOn' | 'wordMap' | 'rawEntries' | 'type'
>;
