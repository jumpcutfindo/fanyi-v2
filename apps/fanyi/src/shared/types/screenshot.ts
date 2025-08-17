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

export interface ScreenshotPreset {
  id: string;
  name: string;
  description: string;
  options: ScreenshotOptions;
}

export type AddScreenshotPresetPayload = Omit<ScreenshotPreset, 'id'>;
