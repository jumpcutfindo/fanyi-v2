import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';
import * as pinyin from 'pinyin-pro';

import {
  Dictionary,
  DictionaryEntry,
  DictionaryMinimal,
  RawDictionaryEntry,
} from '@shared/types/dictionary';

let defaultDictionary: Dictionary | null = null;

function rawEntriesToMap(
  rawEntries: RawDictionaryEntry[]
): Record<string, DictionaryEntry> {
  return rawEntries.reduce(
    (acc, entry) => {
      // Skip useless entries
      if (entry.definition.includes('variant of')) {
        return acc;
      }

      // Modify all pinyins
      entry.pinyin = pinyin.convert(entry.pinyin.toLowerCase(), {
        format: 'numToSymbol',
      });

      // Modify all pinyins within definition
      const pinyins = entry.definition.matchAll(/\[(.*?)\]/g);

      for (const match of pinyins) {
        const individualPinyin = match[0].matchAll(/[a-z]+[1-4]/gi);

        for (const innerMatch of individualPinyin) {
          entry.definition = entry.definition.replace(
            innerMatch[0],
            pinyin.convert(innerMatch[0].toLowerCase(), {
              format: 'numToSymbol',
            })
          );
        }
      }

      // Retrieve links from the definition
      const externalReferences = entry.definition.matchAll(/[\u4E00-\u9FFF]+/g);
      const links = [];

      for (const match of externalReferences) {
        links.push({
          word: match[0],
          start: match.index,
        });
      }

      if (acc[entry.simplified]) {
        acc[entry.simplified].definitions.push({
          definition: entry.definition,
          links,
        });
      } else {
        acc[entry.simplified] = {
          ...entry,
          definitions: [
            {
              definition: entry.definition,
              links,
            },
          ],
        };
      }

      return acc;
    },
    {} as Record<string, DictionaryEntry>
  );
}

export function initDefaultDictionary() {
  console.log('Loading dictionary...');

  // Retrieve the contents of the dictionary file
  const rawDictionary = fs.readFileSync(
    path.join(process.env.VITE_PUBLIC, 'cedict_ts.u8'),
    'utf-8'
  );

  // Define the regex with named capture groups
  const regex =
    /^(?<traditional>.*?)\s+(?<simplified>.*?)\s+\[(?<pinyin>.*?)\]\s+\/(?<definition>.*?)\/\s*?/gm;

  const rawEntries = [];

  for (const match of rawDictionary.matchAll(regex)) {
    rawEntries.push({
      traditional: match.groups!.traditional,
      simplified: match.groups!.simplified,
      pinyin: match.groups!.pinyin.toLowerCase(),
      definition: match.groups!.definition,
    });
  }

  defaultDictionary = {
    id: 'default',
    name: 'Default (CEDICT)',
    createdOn: new Date(),
    modifiedOn: new Date(),
    rawEntries,
    wordMap: rawEntriesToMap(rawEntries),
  };

  console.log(`Loaded default dictionary with ${rawEntries.length} entries`);
}

export function getDictionaryEntries(queries: string[]) {
  if (!defaultDictionary) {
    throw new Error('Dictionary not initialized');
  }

  const entryMap: Record<string, DictionaryEntry> = {};

  for (const query of queries) {
    entryMap[query] = defaultDictionary.wordMap[query];
  }

  const results: DictionaryEntry[] = [];

  // Break up items with no entries into individual words, and process them
  for (const key of Object.keys(entryMap)) {
    if (!entryMap[key]) {
      // Split the key into individual words
      const individualWords = key.split('');

      entryMap[key] = defaultDictionary.wordMap[key];

      for (const word of individualWords) {
        results.push(defaultDictionary.wordMap[word]);
      }
    } else {
      results.push(entryMap[key]);
    }
  }

  return results.filter((entry) => entry !== undefined);
}

export function getDictionaryEntry(query: string) {
  if (!defaultDictionary) {
    throw new Error('Dictionary not initialized');
  }

  return defaultDictionary.wordMap[query];
}

export function listDictionaries(): DictionaryMinimal[] {
  if (!defaultDictionary) {
    return [];
  }

  return [
    {
      id: defaultDictionary.id,
      name: defaultDictionary.name,
      url: defaultDictionary.url,
      createdOn: defaultDictionary.createdOn,
      modifiedOn: defaultDictionary.modifiedOn,
      wordCount: Object.keys(defaultDictionary.wordMap).length,
    },
  ];
}

export function searchDictionaries(
  queryString: string,
  limit: number
): DictionaryEntry[] {
  const activeDictionaries = [defaultDictionary];

  const allEntries = activeDictionaries.flatMap((dict) =>
    dict ? Object.values(dict.rawEntries) : []
  );

  if (allEntries.length === 0 || !queryString) {
    return [];
  }

  const fuse = new Fuse(allEntries, {
    threshold: 0.0, // 0.0 is a perfect match, 1.0 matches anything
    keys: [
      { name: 'traditional', weight: 1.0 },
      { name: 'simplified', weight: 1.0 },
      { name: 'pinyin', weight: 1.0 },
      { name: 'definition', weight: 1.0 },
    ],
    ignoreDiacritics: true,
    includeScore: true,

    location: 0,
    distance: 600,
  });
  const rawResults = fuse.search(queryString);

  return getDictionaryEntries(rawResults.map((rr) => rr.item.simplified)).slice(
    0,
    limit
  );
}
