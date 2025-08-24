import fs from 'fs';
import path from 'path';
import { Dictionary, DictionaryEntry } from '@shared/types/dictionary';

const pinyinTonesMap: { [key: string]: string[] } = {
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'], // 'v' is often used to represent 'ü'
};

let dictionary: Dictionary | null = null;

function convertPinyin(pinyinWithNumber: string): string {
  // Check for neutral tone (no number or '5')
  const lastChar = pinyinWithNumber.slice(-1);
  if (isNaN(Number(lastChar))) {
    return pinyinWithNumber; // Return as is if no tone number
  }
  const tone = parseInt(lastChar);
  const pinyin = pinyinWithNumber.slice(0, -1);

  // Special case for 'ou'
  if (pinyin.includes('ou')) {
    return pinyin.replace('ou', pinyinTonesMap['o'][tone] + 'u');
  }

  // A and E take priority
  if (pinyin.includes('a')) {
    return pinyin.replace('a', pinyinTonesMap['a'][tone]);
  }
  if (pinyin.includes('e')) {
    return pinyin.replace('e', pinyinTonesMap['e'][tone]);
  }

  // Handle 'iu' and 'ui'
  if (pinyin.includes('iu')) {
    return pinyin.replace('iu', 'i' + pinyinTonesMap['u'][tone]);
  }
  if (pinyin.includes('ui')) {
    return pinyin.replace('ui', 'u' + pinyinTonesMap['i'][tone]);
  }

  // Otherwise, the last vowel takes the tone mark
  const vowels = ['a', 'e', 'i', 'o', 'u', 'v'];
  let lastVowelIndex = -1;
  let lastVowel = '';

  for (let i = pinyin.length - 1; i >= 0; i--) {
    const char = pinyin[i];
    if (vowels.includes(char)) {
      lastVowelIndex = i;
      lastVowel = char;
      break;
    }
  }

  if (lastVowelIndex !== -1) {
    const toneMarkedVowel = pinyinTonesMap[lastVowel][tone];
    return (
      pinyin.slice(0, lastVowelIndex) +
      toneMarkedVowel +
      pinyin.slice(lastVowelIndex + 1)
    );
  }

  return pinyinWithNumber;
}

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
      pinyin: convertPinyin(match.groups!.pinyin),
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

  return queries.map((query) => dictionary!.wordMap[query]);
}

export { initDictionary, getDictionaryEntries };
