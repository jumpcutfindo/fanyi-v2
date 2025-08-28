import { ScreenshotPreset } from '@shared/types/screenshot';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

interface BaseTab {
  id: string;
  title: string;
}

export interface PreviewTab extends BaseTab {
  type: 'preview';
  activePreset: ScreenshotPreset | null;
}

export interface TranslationTab extends BaseTab {
  type: 'translation';
  screenshot: string;
  preset: ScreenshotPreset;
  activeWord: string | null;
}

export type Tab = PreviewTab | TranslationTab;

type TabStore = {
  tabs: Tab[];
  activeTab: Tab | null;
  addTab: (tab: Tab, options?: { setActive?: boolean }) => void;
  removeTab: (tabId: string) => void;
  updateTab: (tab: Tab) => void;
  setActiveTab: (tabId: string) => void;
  isTabActive: (tabId: string) => boolean;
  previewTab: PreviewTab | null;
  setPreviewTab: (
    tab: Omit<PreviewTab, 'id'>,
    options?: { setActive?: boolean }
  ) => void;
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
  removeTab: (tabId) =>
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
  updateTab: (tab) =>
    set((prev) => {
      const newTabs = prev.tabs.map((t) => {
        if (t.id === tab.id) {
          return tab;
        }

        return t;
      });

      return { tabs: newTabs };
    }),
  setActiveTab: (tabId) =>
    set((prev) => {
      // Check preview tab
      if (prev.previewTab?.id === tabId) {
        return { activeTab: prev.previewTab };
      }

      const newActiveTab = prev.tabs.find((t) => t.id === tabId);

      return { activeTab: newActiveTab };
    }),
  isTabActive: (tabId) => get().activeTab?.id === tabId,
  previewTab: null,
  setPreviewTab: (tab, opts) => {
    const newPreviewTab = { ...tab, id: uuidv4() };

    if (opts?.setActive) {
      set({ previewTab: newPreviewTab, activeTab: newPreviewTab });
    }

    set({ previewTab: newPreviewTab });
  },
}));
