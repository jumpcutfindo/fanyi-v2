import { ScreenshotPreset } from "@shared/types/screenshot";
import { create } from "zustand";

interface ManagerOptions {
  selectedPreset: ScreenshotPreset | null;
}

interface EditorOptions {
  mode: "create" | "edit";
  initialPreset?: ScreenshotPreset;
}

type SidebarUnionState =
  | { state: "manager"; options?: ManagerOptions }
  | { state: "editor"; options: EditorOptions };

interface SidebarStore {
  sidebarState: SidebarUnionState;
  setSidebarState: (state: SidebarUnionState) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  sidebarState: { state: "manager" },
  setSidebarState: (state: SidebarUnionState) =>
    set(() => ({ sidebarState: state })),
}));
