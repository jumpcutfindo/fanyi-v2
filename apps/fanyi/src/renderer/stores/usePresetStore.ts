import { ScreenshotPreset } from "@shared/types/screenshot";
import { create } from "zustand";

type PresetStore = {
  activePreset: ScreenshotPreset | null;
  setActivePreset: (preset: ScreenshotPreset | null) => void;
};

export const usePresetStore = create<PresetStore>((set) => ({
  activePreset: null,
  setActivePreset: (preset) => set(() => ({ activePreset: preset })),
}));
