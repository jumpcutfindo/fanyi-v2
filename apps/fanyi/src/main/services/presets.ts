import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

import {
  AddScreenshotPresetPayload,
  ScreenshotPreset,
} from '@shared/types/screenshot';
import { win } from '@main/main';
import * as keybinds from '@main/services/keybinds';
import { takeScreenshotWithPreset } from '@main/services/screenshot';

type StoreType = {
  presets: ScreenshotPreset[];
};

const presetStore = new Store<StoreType>({ name: 'presets' });

export async function addScreenshotPreset(preset: AddScreenshotPresetPayload) {
  const presets = await getScreenshotPresets();

  const newPreset = {
    id: uuidv4(),
    ...preset,
  };

  presetStore.set('presets', [...presets, newPreset]);

  registerPresetKeybind(newPreset);
}

export async function getScreenshotPresets(): Promise<ScreenshotPreset[]> {
  return presetStore.get('presets', []);
}

export async function updateScreenshotPreset(preset: ScreenshotPreset) {
  const presets = await getScreenshotPresets();

  const presetToBeUpdated = presets.find((p) => p.id === preset.id);

  if (presetToBeUpdated) {
    presetStore.set(
      'presets',
      presets.map((p) => (p.id === preset.id ? preset : p))
    );

    // Unregister old keybind and register new one
    unregisterPresetKeybind(presetToBeUpdated);
    registerPresetKeybind(preset);
  }
}

export async function deleteScreenshotPreset(id: string) {
  const presets = await getScreenshotPresets();

  const deletedPreset = presets.find((p) => p.id === id);

  if (deletedPreset) {
    presetStore.set(
      'presets',
      presets.filter((p) => p.id !== id)
    );

    unregisterPresetKeybind(deletedPreset);
  }
}

async function registerPresetKeybind(preset: ScreenshotPreset) {
  if (!preset.keybind) return;

  keybinds.registerKeybind(preset.keybind, async () => {
    const screenshot = await takeScreenshotWithPreset(preset);

    win?.webContents.send(
      'trigger-screenshot-with-preset',
      preset.id,
      screenshot
    );
    console.log(`${preset.name} keybind triggered`, preset.keybind);
  });
}

async function unregisterPresetKeybind(preset: ScreenshotPreset) {
  if (!preset.keybind) return;

  keybinds.unregisterKeybind(preset.keybind);
}

export async function registerKeybindings() {
  const presets = await getScreenshotPresets();

  presets.forEach(registerPresetKeybind);
}
