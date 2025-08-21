import { ScreenshotPreset } from '@shared/types/screenshot';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

interface BaseTab {
  id: string;
  title: string;
}

export interface PreviewTab extends BaseTab {
  type: 'preview';
  activePreset: ScreenshotPreset;
}

export interface TranslationTab extends BaseTab {
  type: 'translation';
  preset: ScreenshotPreset;
}

export type Tab = PreviewTab | TranslationTab;

type TabStore = {
  tabs: Tab[];
  activeTab: Tab | null;
  addTab: (tab: Tab, options?: { setActive?: boolean }) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tab: Tab) => void;
  isTabActive: (tab: Tab) => boolean;
  previewTab: PreviewTab | null;
  setPreviewTab: (tab: PreviewTab) => void;
};

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTab: null,
  addTab: (tab, opts) =>
    set((prev) => {
      const newTab = { ...tab, id: uuidv4() };

      const newTabs = [...prev.tabs, newTab];
      const newActiveTab = opts?.setActive ? newTab : prev.activeTab;

      return { tabs: newTabs, activeTab: newActiveTab };
    }),
  removeTab: (tabId: string) =>
    set((prev) => {
      const tabs = prev.tabs.filter((tab) => tab.id !== tabId);
      const previewTab = prev.previewTab?.id === tabId ? null : prev.previewTab;

      let newActiveTab = null;

      // Check if current active tab was removed
      if (prev.activeTab?.id === tabId) {
        const currActiveTabIdx = prev.tabs.findIndex((tab) => tab.id === tabId);

        // Switch to the one after
        newActiveTab =
          currActiveTabIdx >= 0 && currActiveTabIdx < tabs.length
            ? tabs[currActiveTabIdx]
            : null;

        // If still null, switch to the one before
        if (!newActiveTab) {
          newActiveTab =
            currActiveTabIdx >= 0 ? tabs[currActiveTabIdx - 1] : null;
        }
      }

      return {
        tabs,
        previewTab,
        activeTab: newActiveTab,
      };
    }),
  setActiveTab: (tab: Tab) => set({ activeTab: tab }),
  isTabActive: (tab: Tab) => get().activeTab?.id === tab.id,
  previewTab: null,
  setPreviewTab: (tab: PreviewTab) => set({ previewTab: tab }),
}));
