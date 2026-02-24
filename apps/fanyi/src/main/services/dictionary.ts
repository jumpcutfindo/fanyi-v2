import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Fuse from 'fuse.js';
import * as pinyin from 'pinyin-pro';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateDictionaryEntryPayload,
  CreateDictionaryEntryResult,
  CreateDictionaryPayload,
  CustomDictionary,
  customDictionarySchema,
  Dictionary,
  DictionaryEntry,
  DictionaryMinimal,
  DictionarySearchOptions,
  RawDictionaryEntry,
  UpdateDictionaryEntryPayload,
  UpdateDictionaryEntryResult,
  UpdateDictionaryPayload,
} from '@shared/types/dictionary';
import { logger } from '@main/logger';

const LOCAL_DICTIONARIES_DIR = `${app.getPath('userData')}${path.sep}dictionaries`;

let defaultDictionary: Dictionary | null = null;
const localDictionaries: Dictionary[] = [];

/**
 * Converts a list of raw dictionary entries into a map of entries.
 *
 * Note: This function is difficult to split out due to the reliance of building the map
 * on previously seen entries.
 *
 * Comment: Maybe this can be improved with a custom class, such that adding each item is less
 * taxing?
 */
function rawEntriesToMap(
  rawEntries: RawDictionaryEntry[]
): Record<string, DictionaryEntry> {
  return rawEntries.reduce(
    (acc, entry) => {
      // Skip useless entries
      if (entry.definitions.includes('variant of')) {
        return acc;
      }

      // Modify all pinyins
      entry.pinyin = pinyin.convert(entry.pinyin.toLowerCase(), {
        format: 'numToSymbol',
      });

      // Modify all pinyins within definitions
      const pinyins = entry.definitions.matchAll(/\[(.*?)\]/g);

      for (const match of pinyins) {
        const individualPinyin = match[0].matchAll(/[a-z]+[1-4]/gi);

        for (const innerMatch of individualPinyin) {
          entry.definitions = entry.definitions.replace(
            innerMatch[0],
            pinyin.convert(innerMatch[0].toLowerCase(), {
              format: 'numToSymbol',
            })
          );
        }
      }

      // Split and process definitions
      const definitions = entry.definitions.split('/');

      for (const definition of definitions) {
        // Retrieve links from the definition
        const externalReferences = definition.matchAll(/[\u4E00-\u9FFF]+/g);

        const links = [];
        for (const match of externalReferences) {
          links.push({
            word: match[0],
            start: match.index,
          });
        }

        if (acc[entry.simplified]) {
          acc[entry.simplified].definitions.push({
            definition,
            links,
          });
        } else {
          acc[entry.simplified] = {
            ...entry,
            definitions: [
              {
                definition,
                links,
              },
            ],
          };
        }
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
  logger.info('Loading default dictionary...');

  // Retrieve the contents of the dictionary file
  const rawDictionary = fs.readFileSync(
    path.join(process.env.VITE_PUBLIC, 'cedict_ts.u8'),
    'utf-8'
  );

  // Define the regex with named capture groups
  const regex =
    /^(?<traditional>\S+)\s+(?<simplified>\S+)\s+\[(?<pinyin>[^\]]+)\]\s+\/(?<definitions>.*)\/\s*$/gm;

  const rawEntries: RawDictionaryEntry[] = [];

  for (const match of rawDictionary.matchAll(regex)) {
    if (!match.groups) {
      continue;
    }

    const { traditional, simplified, pinyin, definitions } = match.groups;

    rawEntries.push({
      id: uuidv4(),
      traditional,
      simplified,
      pinyin: pinyin.toLowerCase(),
      definitions,
    });
  }

  defaultDictionary = {
    id: 'default',
    type: 'system',
    name: 'Default (CEDICT)',
    createdOn: new Date(),
    modifiedOn: new Date(),
    rawEntries,
    wordMap: rawEntriesToMap(rawEntries),
  };

  logger.info(`Loaded default dictionary with ${rawEntries.length} entries`);
}

export function getDefaultDictionaryEntries(queries: string[]) {
  return defaultDictionary
    ? getDictionaryEntries([defaultDictionary], queries)
    : [];
}

export function getDictionaryEntries(
  dictionaries: Dictionary[],
  queries: string[]
) {
  if (dictionaries.length === 0) {
    logger.warn('No dictionaries were provided getDictionaryEntries');
    return [];
  }

  const entryMap: Record<string, DictionaryEntry> = {};

  for (const query of queries) {
    for (const dict of dictionaries) {
      const sourceEntry = dict.wordMap[query];

      if (!sourceEntry) {
        // Skip if entry not found
        continue;
      }

      if (entryMap[query]) {
        // Combine definition with existing query
        entryMap[query].definitions = [
          ...entryMap[query].definitions,
          ...sourceEntry.definitions,
        ];
      } else {
        // If not, add the entry
        entryMap[query] = {
          ...sourceEntry,
          definitions: [...sourceEntry.definitions],
        };
      }
    }
  }

  return Object.values(entryMap).filter((entry) => entry !== undefined);
}

export function getDictionaryEntry(query: string) {
  if (!defaultDictionary) {
    throw new Error('Dictionary not initialized');
  }

  return defaultDictionary.wordMap[query];
}

export function createDictionaryEntry(
  dictionaryId: string,
  entry: CreateDictionaryEntryPayload
): CreateDictionaryEntryResult {
  logger.debug(`Adding dictionary entry "${entry.simplified}"`);

  const dictionary = localDictionaries.find((dict) => dict.id === dictionaryId);

  if (!dictionary) {
    logger.warn(`Dictionary with ID ${dictionaryId} not found`);
    return { status: 'error' };
  }

  logger.debug(
    `Dictionary entry "${entry.simplified}" will be added to dictionary "${dictionary.name}" (${dictionary.id})`
  );

  // Check if the word already exists and throw an error if it does
  if (dictionary.wordMap[entry.simplified]) {
    logger.warn(
      `Dictionary entry "${entry.simplified}" already exists in dictionary "${dictionary.name}" (${dictionary.id})`
    );
    return { status: 'duplicate' };
  }

  dictionary.rawEntries.push({
    id: uuidv4(),
    simplified: entry.simplified,
    traditional: entry.traditional,
    pinyin: entry.pinyin,
    definitions: entry.definitions.join('/'),
  });

  // Note: This function is potentially expensive if there are many words in the dictionary
  // However, this is necessary due to the interdependence of words on each other
  dictionary.wordMap = rawEntriesToMap(dictionary.rawEntries);

  // Persist to file
  saveLocalDictionary({
    id: dictionary.id,
    name: dictionary.name,
    createdOn: dictionary.createdOn,
    url: dictionary.url,
    rawEntries: dictionary.rawEntries,
    modifiedOn: new Date(),
  });

  return { status: 'success' };
}

export function deleteDictionaryEntry(dictionaryId: string, entryId: string) {
  const dictionary = localDictionaries.find((dict) => dict.id === dictionaryId);

  if (!dictionary) {
    logger.warn(`Dictionary with ID ${dictionaryId} not found`);
    return;
  }

  dictionary.rawEntries = dictionary.rawEntries.filter(
    (entry) => entry.id !== entryId
  );

  // Note: This function is potentially expensive if there are many words in the dictionary
  // However, this is necessary due to the interdependence of words on each other
  dictionary.wordMap = rawEntriesToMap(dictionary.rawEntries);

  // Persist to file
  saveLocalDictionary({
    id: dictionary.id,
    name: dictionary.name,
    url: dictionary.url,
    rawEntries: dictionary.rawEntries,
    createdOn: dictionary.createdOn,
    modifiedOn: new Date(),
  });
}

export function updateDictionaryEntry(
  dictionaryId: string,
  entryId: string,
  payload: UpdateDictionaryEntryPayload
): UpdateDictionaryEntryResult {
  const dictionary = localDictionaries.find((dict) => dict.id === dictionaryId);

  if (!dictionary) {
    logger.warn(`Dictionary with ID ${dictionaryId} not found`);
    return { status: 'error' };
  }

  const entryToUpdate = dictionary.rawEntries.find(
    (rawEntry) => rawEntry.id === entryId
  );

  if (!entryToUpdate) {
    logger.warn(
      `Dictionary entry with ID ${entryId} not found in dictiionary ${dictionaryId}`
    );
    return { status: 'error' };
  }

  // Check if the word already exists
  if (dictionary.wordMap[payload.simplified]) {
    logger.warn(
      `Dictionary entry "${payload.simplified}" already exists in dictionary "${dictionary.name}" (${dictionary.id})`
    );
    return { status: 'duplicate' };
  }

  entryToUpdate.simplified = payload.simplified;
  entryToUpdate.traditional = payload.traditional;
  entryToUpdate.pinyin = payload.pinyin;
  entryToUpdate.definitions = payload.definitions.join('/');

  // Note: This function is potentially expensive if there are many words in the dictionary
  // However, this is necessary due to the interdependence of words on each other
  dictionary.wordMap = rawEntriesToMap(dictionary.rawEntries);

  // Persist to file
  saveLocalDictionary({
    id: dictionary.id,
    name: dictionary.name,
    url: dictionary.url,
    rawEntries: dictionary.rawEntries,
    createdOn: dictionary.createdOn,
    modifiedOn: new Date(),
  });

  return { status: 'success' };
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

function getDictionariesFromOptions(
  options: DictionarySearchOptions
): Dictionary[] {
  if (!defaultDictionary) {
    throw new Error('Default dictionary not initialized');
  }

  if (options.space === 'specific') {
    if (!options.dictionaryId) {
      return [defaultDictionary];
    }

    const matchingDictionary = localDictionaries.find(
      (dict) => dict.id === options.dictionaryId
    );

    if (!matchingDictionary) {
      return [];
    } else {
      return [matchingDictionary];
    }
  } else {
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
      getDictionaryEntries(
        dictionaries,
        allEntries.map((entry) => entry.simplified)
      )
    );
  }

  const fuse = new Fuse(allEntries, {
    threshold: 0.2, // 0.0 is a perfect match, 1.0 matches anything
    keys: [
      { name: 'traditional', weight: 1.0 },
      { name: 'simplified', weight: 1.0 },
      { name: 'pinyin', weight: 1.0 },
      { name: 'definitions', weight: 1.0 },
    ],
    ignoreDiacritics: true,
    includeScore: true,
    sortFn: (a, b) => a.score - b.score,

    location: 0,
    distance: 600,
  });
  const rawResults = fuse.search(queryString);

  return spliceResult(
    getDictionaryEntries(
      dictionaries,
      rawResults.map((rr) => rr.item.simplified)
    )
  );
}

export function initLocalDictionaries() {
  logger.info('Loading local dictionaries...');

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
        logger.warn(
          `Invalid dictionary data in ${filePath}: ${parsedDictionary.error.message}`
        );
      } else {
        localDictionaries.push({
          ...parsedDictionary.data,
          type: 'custom',
          wordMap: rawEntriesToMap(parsedDictionary.data.rawEntries),
        });

        logger.info(
          `Loaded dictionary ${parsedDictionary.data.name} with ${parsedDictionary.data.rawEntries.length} entries`
        );
      }
    } catch (e) {
      logger.warn(`Failed to load dictionary ${file}: ${e}`);
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

    logger.debug(
      `Saved dictionary "${parsedDictionary.data.name}" with ${parsedDictionary.data.rawEntries.length} entries`
    );
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

    logger.info(`Deleted dictionary "${dictionary.name}" (${id})`);
  } else {
    logger.warn(`Dictionary with ID ${id} not found`);
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

    logger.info(`Updated dictionary "${dictionary.name}" (${dictionary.id})`);

    return getMinimalDictionary(localDictionaries[index]);
  } else {
    logger.warn(`Dictionary with ID ${dictionary.id} not found`);
  }
}
