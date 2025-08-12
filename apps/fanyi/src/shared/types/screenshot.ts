export type ScreenshotSourceType = 'screen' | 'window';

export interface ScreenshotSource {
  type: ScreenshotSourceType;
  id: string;
  name: string;
}

type BaseScreenshotOptions = {
  id: string;
};

interface ScreenScreenshotOptions extends BaseScreenshotOptions {
  type: 'screen';
  preset: unknown; // TODO: Implement preset system
}

interface WindowScreenshotOptions extends BaseScreenshotOptions {
  type: 'window';
}

export type ScreenshotOptions =
  | ScreenScreenshotOptions
  | WindowScreenshotOptions;
