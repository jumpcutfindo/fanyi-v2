import fs from 'fs';
import path from 'path';
import * as pinyin from 'pinyin-pro';

import { Dictionary, DictionaryEntry } from '@shared/types/dictionary';

let dictionary: Dictionary | null = null;

function initDictionary() {
  console.log('Loading dictionary...');

  // Retrieve the contents of the dictionary file
  const rawDictionary = fs.readFileSync(
    path.join(process.env.VITE_PUBLIC, 'cedict_ts.u8'),
    'utf-8'
  );

  // Define the regex with named capture groups
  const regex =
    /^(?<traditional>.*?)\s+(?<simplified>.*?)\s+\[(?<pinyin>.*?)\]\s+\/(?<definition>.*?)\/\s*?/gm;

  const entries: DictionaryEntry[] = [];

  for (const match of rawDictionary.matchAll(regex)) {
    entries.push({
      traditional: match.groups!.traditional,
      simplified: match.groups!.simplified,
      pinyin: pinyin.convert(match.groups!.pinyin.toLowerCase(), {
        format: 'numToSymbol',
      }),
      definition: match.groups!.definition,
    });
  }

  dictionary = {
    wordMap: entries.reduce(
      (acc, entry) => {
        acc[entry.simplified] = entry;
        return acc;
      },
      {} as Record<string, DictionaryEntry>
    ),
  };

  console.log(`Loaded dictionary with ${entries.length} entries`);
}

function getDictionaryEntries(queries: string[]) {
  if (!dictionary) {
    throw new Error('Dictionary not initialized');
  }

  const entryMap: Record<string, DictionaryEntry> = {};

  for (const query of queries) {
    entryMap[query] = dictionary.wordMap[query];
  }

  const results: DictionaryEntry[] = [];

  // Break up items with no entries into individual words, and process them
  for (const key of Object.keys(entryMap)) {
    if (!entryMap[key]) {
      // Split the key into individual words
      const individualWords = key.split('');

      entryMap[key] = dictionary.wordMap[key];

      for (const word of individualWords) {
        results.push(dictionary.wordMap[word]);
      }
    } else {
      results.push(entryMap[key]);
    }
  }

  return results.filter((entry) => entry !== undefined);
}

export { initDictionary, getDictionaryEntries };
