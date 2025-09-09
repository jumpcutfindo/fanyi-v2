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

  const entries = [];

  for (const match of rawDictionary.matchAll(regex)) {
    entries.push({
      traditional: match.groups!.traditional,
      simplified: match.groups!.simplified,
      pinyin: pinyin.convert(match.groups!.pinyin.toLowerCase(), {
        format: 'numToSymbol',
      }),
      defintion: match.groups!.definition,
    });
  }

  dictionary = {
    wordMap: entries.reduce(
      (acc, entry) => {
        // Skip useless entries
        if (entry.defintion.includes('variant of')) {
          return acc;
        }

        // Modify all pinyins within definition
        const pinyins = entry.defintion.matchAll(/\[(.*?)\]/g);

        for (const match of pinyins) {
          const individualPinyin = match[0].matchAll(/[a-z]+[1-4]/gi);

          for (const innerMatch of individualPinyin) {
            entry.defintion = entry.defintion.replace(
              innerMatch[0],
              pinyin.convert(innerMatch[0].toLowerCase(), {
                format: 'numToSymbol',
              })
            );
          }
        }

        // Retrieve links from the definition
        const externalReferences =
          entry.defintion.matchAll(/[\u4E00-\u9FFF]+/g);
        const links = [];

        for (const match of externalReferences) {
          links.push({
            word: match[0],
            start: match.index,
          });
        }

        if (acc[entry.simplified]) {
          acc[entry.simplified].defintions.push({
            definition: entry.defintion,
            links,
          });
        } else {
          acc[entry.simplified] = {
            ...entry,
            defintions: [
              {
                definition: entry.defintion,
                links,
              },
            ],
          };
        }

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

function getRawDictionaryEntry(query: string) {
  if (!dictionary) {
    throw new Error('Dictionary not initialized');
  }

  return dictionary.wordMap[query];
}

export { initDictionary, getDictionaryEntries, getRawDictionaryEntry };
