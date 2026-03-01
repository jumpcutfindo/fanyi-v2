import { z } from 'zod';

const rawDictionaryEntrySchema = z.object({
  id: z.string(),
  simplified: z.string(),
  traditional: z.string(),
  pinyin: z.string(),
  definitions: z.string(),
});

/**
 * Represents a dictionary entry when parsed from the CEDICT dictionary
 */
export type RawDictionaryEntry = z.infer<typeof rawDictionaryEntrySchema>;

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
 * Represents an app-internal version of the dictionary entry
 * This entry is processed from RawDictionaryEntry
 */
export interface DictionaryEntry {
  id: string; // Value should be derived from the raw entry
  traditional: string;
  simplified: string;
  pinyin: string;
  definitions: {
    definition: string;
    sourceDictionaryName: string;
    dictionaryType: Dictionary['type'];
    links: {
      word: string;
      start: number;
    }[];
  }[];
}

interface BaseSearchOptions {
  offset: number;
  limit: number;
}

type AllSearchOptions = BaseSearchOptions & {
  space: 'all';
};

type SpecificSearchOptions = BaseSearchOptions & {
  space: 'specific';
  dictionaryId: string;
};

export type DictionarySearchOptions = AllSearchOptions | SpecificSearchOptions;

export type CreateDictionaryPayload = Omit<
  Dictionary,
  'id' | 'createdOn' | 'modifiedOn' | 'wordMap' | 'rawEntries' | 'type'
>;

export type UpdateDictionaryPayload = Omit<
  Dictionary,
  'createdOn' | 'modifiedOn' | 'wordMap' | 'rawEntries' | 'type'
>;

export type CreateDictionaryEntryPayload = Omit<
  RawDictionaryEntry,
  'id' | 'definitions'
> & {
  definitions: string[];
};

export interface CreateDictionaryEntryResult {
  status: 'success' | 'duplicate' | 'error';
}

export type DeleteDictionaryEntryPayload = {
  dictionaryId: string;
  entryId: string;
};

export type UpdateDictionaryEntryPayload = CreateDictionaryEntryPayload;

export type UpdateDictionaryEntryResult = CreateDictionaryEntryResult;
