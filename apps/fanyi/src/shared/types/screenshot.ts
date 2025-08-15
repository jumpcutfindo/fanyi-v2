export type ScreenshotSourceType = 'screen' | 'window';

export interface ScreenshotSource {
  type: ScreenshotSourceType;
  id: string;
  name: string;
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
  name: string;
  description: string;
  options: ScreenshotOptions;
}
