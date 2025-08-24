import fs from 'fs';
import path from 'path';
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
      pinyin: match.groups!.pinyin,
      definition: match.groups!.definition,
    });
  }

  dictionary = {
    wordMap: entries.reduce(
      (acc, entry) => {
        acc[entry.traditional] = entry;
        return acc;
      },
      {} as Record<string, DictionaryEntry>
    ),
  };

  console.log(`Loaded dictionary with ${entries.length} entries`);
}

export { initDictionary };
