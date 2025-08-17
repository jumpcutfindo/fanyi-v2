import { ScreenshotPreset } from '@shared/types/screenshot';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

interface BaseTab {
  id: string;
  title: string;
}

interface PreviewTab extends BaseTab {
  type: 'preview';
  activePreset: ScreenshotPreset;
}

interface TranslationTab extends BaseTab {
  type: 'translation';
  preset: ScreenshotPreset;
}

export type Tab = PreviewTab | TranslationTab;

type TabStore = {
  tabs: Tab[];
  activeTab: Tab | null;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tab: Tab) => void;
  isTabActive: (tab: Tab) => boolean;
};

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTab: null,
  addTab: (tab: Tab) =>
    set((prev) => ({ tabs: [...prev.tabs, { ...tab, id: uuidv4() }] })),
  removeTab: (tabId: string) =>
    set((prev) => ({ tabs: prev.tabs.filter((tab) => tab.id !== tabId) })),
  setActiveTab: (tab: Tab) => set({ activeTab: tab }),
  isTabActive: (tab: Tab) => get().activeTab?.id === tab.id,
}));

