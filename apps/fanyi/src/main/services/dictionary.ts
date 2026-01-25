import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Fuse from 'fuse.js';
import * as pinyin from 'pinyin-pro';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateDictionaryPayload,
  CustomDictionary,
  customDictionarySchema,
  Dictionary,
  DictionaryEntry,
  DictionaryMinimal,
  DictionarySearchOptions,
  RawDictionaryEntry,
  UpdateDictionaryPayload,
} from '@shared/types/dictionary';

const LOCAL_DICTIONARIES_DIR = `${app.getPath('userData')}${path.sep}dictionaries`;

let defaultDictionary: Dictionary | null = null;
const localDictionaries: Dictionary[] = [];

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

function getMinimalDictionary(dictionary: Dictionary): DictionaryMinimal {
  return {
    id: dictionary.id,
    type: dictionary.type,
    name: dictionary.name,
    createdOn: dictionary.createdOn,
    modifiedOn: dictionary.modifiedOn,
    wordCount: Object.keys(dictionary.wordMap).length,
  };
}

export function initDefaultDictionary() {
  console.log('Loading default dictionary...');

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
    type: 'custom',
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
    getMinimalDictionary(defaultDictionary),
    ...localDictionaries.map((dict) => getMinimalDictionary(dict)),
  ];
}

function getDictionariesFromOptions(options: DictionarySearchOptions) {
  switch (options.space) {
    case 'specific':
      if (options.dictionaryId === 'default') {
        return [defaultDictionary];
      }

      return [
        localDictionaries.find((dict) => dict.id === options.dictionaryId),
      ];
    case 'all':
    default:
      return [defaultDictionary, ...localDictionaries];
  }
}

export function searchDictionaries(
  queryString: string,
  options: DictionarySearchOptions
): DictionaryEntry[] {
  const dictionaries = getDictionariesFromOptions(options);

  function spliceResult(entries: DictionaryEntry[]) {
    return entries.splice(options.offset, options.limit);
  }

  const allEntries = dictionaries.flatMap((dict) =>
    dict ? Object.values(dict.rawEntries) : []
  );

  if (allEntries.length === 0) {
    return [];
  }

  if (!queryString || queryString === '') {
    return spliceResult(
      getDictionaryEntries(allEntries.map((entry) => entry.simplified))
    );
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

  return spliceResult(
    getDictionaryEntries(rawResults.map((rr) => rr.item.simplified))
  );
}

export function initLocalDictionaries() {
  console.log('Loading local dictionaries...', LOCAL_DICTIONARIES_DIR);

  // If folder doesn't exist, create
  if (!fs.existsSync(LOCAL_DICTIONARIES_DIR)) {
    fs.mkdirSync(LOCAL_DICTIONARIES_DIR);
  }

  // Look for all JSON files inside and load the data
  const files = fs.readdirSync(LOCAL_DICTIONARIES_DIR);
  for (const file of files) {
    try {
      const filePath = `${LOCAL_DICTIONARIES_DIR}${path.sep}${file}`;
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Check whether data follows schema
      const parsedDictionary = customDictionarySchema.safeParse(fileData);

      // If unable to parse, skip
      if (parsedDictionary.error) {
        console.warn(
          `Invalid dictionary data in ${filePath}: ${parsedDictionary.error.message}`
        );
      } else {
        localDictionaries.push({
          ...parsedDictionary.data,
          type: 'custom',
          wordMap: rawEntriesToMap(parsedDictionary.data.rawEntries),
        });

        console.log(
          `Loaded dictionary ${parsedDictionary.data.name} with ${parsedDictionary.data.rawEntries.length} entries`
        );
      }
    } catch (e) {
      console.warn(`Failed to load dictionary ${file}: ${e}`);
    }
  }
}

function saveLocalDictionary(dictionary: CustomDictionary) {
  // Run sanity check on the file's format
  const parsedDictionary = customDictionarySchema.safeParse(dictionary);

  if (parsedDictionary.error) {
    throw new Error(parsedDictionary.error.message);
  } else {
    // Write the dictionary to a file
    const filePath = `${LOCAL_DICTIONARIES_DIR}${path.sep}${dictionary.id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(dictionary, null, 2));
  }
}

function deleteLocalDictionary(id: string) {
  const filePath = `${LOCAL_DICTIONARIES_DIR}${path.sep}${id}.json`;
  fs.unlinkSync(filePath);
}

export function createDictionary(dictionary: CreateDictionaryPayload) {
  const newDictionary: CustomDictionary = {
    ...dictionary,
    id: uuidv4(),
    createdOn: new Date(),
    modifiedOn: new Date(),
    rawEntries: [],
  };

  // Save dictionary
  saveLocalDictionary(newDictionary);

  // Add dictionary to list
  const fullDictionary = {
    ...newDictionary,
    type: 'custom' as const,
    wordMap: {},
  };

  localDictionaries.push(fullDictionary);

  return getMinimalDictionary(fullDictionary);
}

export function deleteDictionary(id: string) {
  const index = localDictionaries.findIndex((dict) => dict.id === id);

  if (index !== -1) {
    const dictionary = localDictionaries[index];
    localDictionaries.splice(index, 1);

    // Remove from local files
    deleteLocalDictionary(id);

    console.log(`Deleted dictionary "${dictionary.name}" (${id})`);
  } else {
    console.warn(`Dictionary with ID ${id} not found`);
  }
}

export function updateDictionary(dictionary: UpdateDictionaryPayload) {
  const index = localDictionaries.findIndex(
    (dict) => dict.id === dictionary.id
  );

  if (index !== -1) {
    localDictionaries[index] = {
      ...localDictionaries[index],
      ...dictionary,
    };

    // Write updates to file
    saveLocalDictionary(localDictionaries[index]);

    console.log(`Updated dictionary "${dictionary.name}" (${dictionary.id})`);

    return getMinimalDictionary(localDictionaries[index]);
  } else {
    console.warn(`Dictionary with ID ${dictionary.id} not found`);
  }
}
