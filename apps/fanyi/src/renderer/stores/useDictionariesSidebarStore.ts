import { create } from 'zustand';

import { DictionaryMinimal } from '@shared/types/dictionary';

interface DictionariesSidebarStore {
  selectedDictionary: DictionaryMinimal | null;
  setSelectedDictionary: (dictionary: DictionaryMinimal | null) => void;
}

export const useDictionariesSidebarStore = create<DictionariesSidebarStore>(
  (set) => ({
    selectedDictionary: null,
    setSelectedDictionary: (dictionary) =>
      set({ selectedDictionary: dictionary }),
  })
);
