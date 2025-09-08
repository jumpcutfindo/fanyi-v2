export type ScreenshotSourceType = 'screen' | 'window';

export interface ScreenshotSource {
  type: ScreenshotSourceType;
  id: string;
  name: string;
  size: {
    width: number;
    height: number;
  };
}

export type ScreenshotOptions = {
  type: 'screen' | 'window';
  sourceId: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

interface BaseScreenshotPreset {
  id: string;
  name: string;
  description: string;
}

interface TemporaryScreenshotPreset extends BaseScreenshotPreset {
  type: 'temporary';
}

export interface CustomScreenshotPreset extends BaseScreenshotPreset {
  type: 'custom';
  options: ScreenshotOptions;
  keybind?: string;
}

export type ScreenshotPreset =
  | TemporaryScreenshotPreset
  | CustomScreenshotPreset;

export type AddScreenshotPresetPayload = Omit<CustomScreenshotPreset, 'id'>;
