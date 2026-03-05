/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RawDictionaryEntry } from '@shared/types/dictionary';

// Mock electron before any imports
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user/data'),
  },
}));

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid'),
}));

vi.mock('pinyin-pro', () => ({
  convert: vi.fn((str) => str), // Simplified: returns as is by default
}));

vi.mock('@main/logger');
vi.mock('@main/services/ocr');

describe('dictionary service', () => {
  let dictionaryService: typeof import('./dictionary');
  let pinyin: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.VITE_PUBLIC = '/mock/public';
    dictionaryService = await import('./dictionary');
    pinyin = await import('pinyin-pro');
  });

  describe('rawEntriesToMap', () => {
    const mockDict: any = { name: 'Test Dict', type: 'system' };

    it('should skip "variant of" entries', async () => {
      const rawEntries: RawDictionaryEntry[] = [
        {
          id: '1',
          simplified: 'XX',
          traditional: 'XX',
          pinyin: 'xx',
          definitions: 'variant of YY',
        },
        {
          id: '2',
          simplified: '正常',
          traditional: '正常',
          pinyin: 'zheng4 chang2',
          definitions: 'normal',
        },
      ];

      const result = dictionaryService.rawEntriesToMap(mockDict, rawEntries);

      expect(result['XX']).toBeUndefined();
      expect(result['正常']).toBeDefined();
    });

    it('should replace number based pinyins', async () => {
      const rawEntries: RawDictionaryEntry[] = [
        {
          id: '1',
          simplified: '成功',
          traditional: '成功',
          pinyin: 'cheng2 gong1',
          definitions: 'succesful',
        },
      ];

      pinyin.convert.mockImplementation((str: string) => {
        if (str === 'cheng2 gong1') return 'replaced pinyin';
        return str;
      });

      const result = dictionaryService.rawEntriesToMap(mockDict, rawEntries);

      expect(result['成功'].pinyin).toBe('replaced pinyin');
    });

    it('should replace number based pinyins in definitions', async () => {
      const rawEntries: RawDictionaryEntry[] = [
        {
          id: '1',
          simplified: '成功',
          traditional: '成功',
          pinyin: 'cheng2 gong1',
          definitions: 'succesful [ni2 hao3]',
        },
      ];

      pinyin.convert.mockImplementation((str: string) => {
        if (str === 'ni2') return 'replaced';
        if (str === 'hao3') return 'pinyin';
        return str;
      });

      const result = dictionaryService.rawEntriesToMap(mockDict, rawEntries);

      expect(result['成功'].definitions[0].definition).toBe(
        'succesful [replaced pinyin]'
      );
    });

    it('should process complex definitions with nested pinyin and links', async () => {
      const rawEntries: RawDictionaryEntry[] = [
        {
          id: '1',
          simplified: 'TEST',
          traditional: 'TEST',
          pinyin: 'test',
          definitions: 'see 你好 [ni3]',
        },
      ];

      pinyin.convert.mockImplementation((str: string) => {
        if (str === 'ni3') return 'nǐ';
        return str;
      });

      const result = dictionaryService.rawEntriesToMap(mockDict, rawEntries);

      expect(result['TEST'].definitions[0].definition).toBe('see 你好 [nǐ]');
      expect(result['TEST'].definitions[0].links).toHaveLength(1);
      expect(result['TEST'].definitions[0].links[0]).toEqual({
        word: '你好',
        start: 4,
      });
    });
  });

  describe('initDefaultDictionary', () => {
    it('should successfully parse standard CEDICT entries', async () => {
      const mockData = '傳統 传统 [ni3 hao3] /hello/hi/\n';
      (fs.readFileSync as any).mockReturnValue(mockData);

      pinyin.convert.mockImplementation((str: string) => {
        if (str === 'ni3 hao3') return 'nǐ hǎo';
        return str;
      });

      dictionaryService.initDefaultDictionary();

      const entry = dictionaryService.getDictionaryEntry('传统');
      expect(entry).not.toBeNull();
      expect(entry?.traditional).toBe('傳統');
      expect(entry?.pinyin).toBe('nǐ hǎo');
      expect(entry?.definitions).toHaveLength(2);
      expect(entry?.definitions[0].definition).toBe('hello');
    });

    it('should successfully parse multiple valid entries', async () => {
      const mockData =
        [
          '一 一 [yi1] /one/',
          '二 二 [er4] /two/',
          '三 三 [san1] /three/',
          '四 四 [si4] /four/',
          '五 五 [wu3] /five/',
        ].join('\n') + '\n';

      (fs.readFileSync as any).mockReturnValue(mockData);

      dictionaryService.initDefaultDictionary();

      const dictionaries = dictionaryService.listDictionaries();
      expect(dictionaries).toHaveLength(1);
      expect(dictionaries[0].wordCount).toBe(5);

      expect(dictionaryService.getDictionaryEntry('一')).not.toBeNull();
      expect(dictionaryService.getDictionaryEntry('五')).not.toBeNull();
    });

    it('should handle malformed data by skipping invalid lines', async () => {
      const mockData =
        'INVALID LINE\n傳統 传统 [ni3 hao3] /hello/\nNOT MATCHING';
      (fs.readFileSync as any).mockReturnValue(mockData);

      dictionaryService.initDefaultDictionary();

      const entries = dictionaryService.listDictionaries();
      expect(entries[0].wordCount).toBe(1);
    });

    it('should handle empty dictionary file', async () => {
      (fs.readFileSync as any).mockReturnValue('');

      dictionaryService.initDefaultDictionary();

      const entries = dictionaryService.listDictionaries();
      expect(entries[0].wordCount).toBe(0);
    });

    it('should throw error if getDictionaryEntry is called before init', async () => {
      expect(() => dictionaryService.getDictionaryEntry('test')).toThrow(
        'Dictionary not initialized'
      );
    });
  });

  describe('getDictionaryEntries', () => {
    const mockEntry1: any = {
      id: '1',
      simplified: '测试',
      traditional: '測試',
      pinyin: 'ce4 shi4',
      definitions: [
        {
          definition: 'test',
          sourceDictionaryName: 'Dict 1',
          dictionaryType: 'custom',
        },
      ],
    };

    const mockEntry2: any = {
      id: '2',
      simplified: '测试',
      traditional: '測試',
      pinyin: 'ce4 shi4',
      definitions: [
        {
          definition: 'to test',
          sourceDictionaryName: 'Dict 2',
          dictionaryType: 'custom',
        },
      ],
    };

    const dict1: any = {
      id: 'dict1',
      name: 'Dict 1',
      wordMap: { 测试: mockEntry1 },
    };
    const dict2: any = {
      id: 'dict2',
      name: 'Dict 2',
      wordMap: { 测试: mockEntry2 },
    };

    it('should return empty array when no dictionaries provided', () => {
      const result = dictionaryService.getDictionaryEntries([], ['测试']);
      expect(result).toEqual([]);
    });

    it('should return empty array when no queries provided', () => {
      const result = dictionaryService.getDictionaryEntries([dict1], []);
      expect(result).toEqual([]);
    });

    it('should return unique entries and merge definitions from multiple dictionaries', () => {
      const result = dictionaryService.getDictionaryEntries(
        [dict1, dict2],
        ['测试']
      );

      expect(result).toHaveLength(1);
      expect(result[0].simplified).toBe('测试');
      expect(result[0].definitions).toHaveLength(2);
      expect(result[0].definitions[0].definition).toBe('test');
      expect(result[0].definitions[1].definition).toBe('to test');
    });

    it('should skip queries that are not found', () => {
      const result = dictionaryService.getDictionaryEntries(
        [dict1],
        ['测试', 'missing']
      );

      expect(result).toHaveLength(1);
      expect(result[0].simplified).toBe('测试');
    });

    it('should not mutate original dictionary wordMap definitions', () => {
      const result = dictionaryService.getDictionaryEntries(
        [dict1, dict2],
        ['测试']
      );

      expect(result[0].definitions).toHaveLength(2);
      expect(dict1.wordMap['测试'].definitions).toHaveLength(1);
      expect(dict2.wordMap['测试'].definitions).toHaveLength(1);
    });

    it('should correctly query multiple dictionaries', () => {
      const mockEntryA = { ...mockEntry1 };
      const mockEntryA2 = { ...mockEntry2 };
      const mockEntryB = {
        id: '2',
        simplified: '你好',
        traditional: '你好',
        pinyin: 'ni3 hao3',
        definitions: [
          {
            definition: 'hello',
            sourceDictionaryName: 'Dict A',
            dictionaryType: 'custom',
          },
        ],
      };

      const dictA = {
        id: 'dictA',
        name: 'Dict A',
        wordMap: { 测试: mockEntryA, 你好: mockEntryB },
      } as any;

      const dictB = {
        id: 'dictB',
        name: 'Dict B',
        wordMap: { 测试: mockEntryA2 },
      } as any;

      const result = dictionaryService.getDictionaryEntries(
        [dictA, dictB],
        ['测试', '你好']
      );

      expect(result).toHaveLength(2);
      expect(result[0].simplified).toBe('测试');
      expect(result[0].definitions).toHaveLength(2); // Definitions should be merged
      expect(result[0].definitions[0].definition).toBe('test');
      expect(result[0].definitions[1].definition).toBe('to test');
      expect(result[1].simplified).toBe('你好'); // Other queries should be handled
      expect(result[1].definitions).toHaveLength(1);
      expect(result[1].definitions[0].definition).toBe('hello');
    });
  });
});
