/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('dictionary service - initDefaultDictionary', () => {
  let dictionaryService: typeof import('./dictionary');
  let pinyin: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.VITE_PUBLIC = '/mock/public';
    dictionaryService = await import('./dictionary');
    pinyin = await import('pinyin-pro');
  });

  it('should successfully parse standard CEDICT entries', async () => {
    const mockData = '傳統 传统 [ni3 hao3] /hello/hi/';
    (fs.readFileSync as any).mockReturnValue(mockData);

    // Mock pinyin conversion behavior
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
    const mockData = [
      '一 一 [yi1] /one/',
      '二 二 [er4] /two/',
      '三 三 [san1] /three/',
      '四 四 [si4] /four/',
      '五 五 [wu3] /five/',
    ].join('\n');

    (fs.readFileSync as any).mockReturnValue(mockData);

    dictionaryService.initDefaultDictionary();

    const dictionaries = dictionaryService.listDictionaries();
    expect(dictionaries).toHaveLength(1);
    expect(dictionaries[0].wordCount).toBe(5);

    expect(dictionaryService.getDictionaryEntry('一')).not.toBeNull();
    expect(dictionaryService.getDictionaryEntry('五')).not.toBeNull();
  });

  it('should skip "variant of" entries', async () => {
    const mockData = '傳統 传统 [ni3 hao3] /variant of 你好/';
    (fs.readFileSync as any).mockReturnValue(mockData);

    dictionaryService.initDefaultDictionary();

    expect(dictionaryService.getDictionaryEntry('传统')).toBeNull();
  });

  it('should process complex definitions with nested pinyin and links', async () => {
    const mockData = 'TEST TEST [test] /see 你好 [ni3]/';
    (fs.readFileSync as any).mockReturnValue(mockData);

    pinyin.convert.mockImplementation((str: string) => {
      if (str === 'ni3') return 'nǐ';
      return str;
    });

    dictionaryService.initDefaultDictionary();

    const entry = dictionaryService.getDictionaryEntry('TEST');
    expect(entry?.definitions[0].definition).toBe('see 你好 [nǐ]');
    expect(entry?.definitions[0].links).toHaveLength(1);
    expect(entry?.definitions[0].links[0]).toEqual({
      word: '你好',
      start: 4,
    });
  });

  it('should handle malformed data by skipping invalid lines', async () => {
    const mockData = 'INVALID LINE\n傳統 传统 [ni3 hao3] /hello/\nNOT MATCHING';
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
