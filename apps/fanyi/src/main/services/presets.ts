import {
  AddScreenshotPresetPayload,
  ScreenshotPreset,
} from '@shared/types/screenshot';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

type StoreType = {
  presets: ScreenshotPreset[];
};

const presetStore = new Store<StoreType>({ name: 'presets' });

export async function addScreenshotPreset(preset: AddScreenshotPresetPayload) {
  const presets = await getScreenshotPresets();
  presetStore.set('presets', [
    ...presets,
    {
      id: uuidv4,
      ...preset,
    },
  ]);
}

export async function getScreenshotPresets(): Promise<ScreenshotPreset[]> {
  return presetStore.get('presets', []);
}
