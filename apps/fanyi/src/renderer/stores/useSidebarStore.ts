import { create } from 'zustand';

import { CustomScreenshotPreset } from '@shared/types/screenshot';

interface ManagerOptions {
  selectedPreset: CustomScreenshotPreset | null;
}

interface EditorOptions {
  mode: 'create' | 'edit';
  initialPreset?: CustomScreenshotPreset;
}

type SidebarUnionState =
  | { state: 'manager'; options?: ManagerOptions }
  | { state: 'editor'; options: EditorOptions };

interface SidebarStore {
  sidebarState: SidebarUnionState;
  setSidebarState: (state: SidebarUnionState) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  sidebarState: { state: 'manager' },
  setSidebarState: (state: SidebarUnionState) =>
    set(() => {
      if (state.state === 'editor') {
        window.api.disableKeybinds();
      } else {
        window.api.enableKeybinds();
      }

      return { sidebarState: state };
    }),
}));
