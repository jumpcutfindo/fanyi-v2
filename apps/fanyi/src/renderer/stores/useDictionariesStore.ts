import { create } from 'zustand';

import { DictionaryMinimal } from '@shared/types/dictionary';

interface DictionariesStore {
  selectedDictionary: DictionaryMinimal | null;
  setSelectedDictionary: (dictionary: DictionaryMinimal | null) => void;
}

export const useDictionariesStore = create<DictionariesStore>((set) => ({
  selectedDictionary: null,
  setSelectedDictionary: (dictionary) =>
    set({ selectedDictionary: dictionary }),
}));
