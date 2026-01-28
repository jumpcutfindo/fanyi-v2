import { create } from 'zustand';

import { CustomScreenshotPreset } from '@shared/types/screenshot';

interface ManagerOptions {
  selectedPreset: CustomScreenshotPreset | null;
}

interface EditorOptions {
  mode: 'create' | 'edit';
  initialPreset?: CustomScreenshotPreset;
}

type ScreenshotUnionState =
  | { state: 'manager'; options?: ManagerOptions }
  | { state: 'editor'; options: EditorOptions };

interface ScreenshotStore {
  sidebarState: ScreenshotUnionState;
  setSidebarState: (state: ScreenshotUnionState) => void;
}

export const useScreenshotStore = create<ScreenshotStore>((set) => ({
  sidebarState: { state: 'manager' },
  setSidebarState: (state: ScreenshotUnionState) =>
    set(() => {
      if (state.state === 'editor') {
        window.api.disableKeybinds();
      } else {
        window.api.enableKeybinds();
      }

      return { sidebarState: state };
    }),
}));
