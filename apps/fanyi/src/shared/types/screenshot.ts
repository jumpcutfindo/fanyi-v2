export interface ScreenshotSource {
  type: 'screen' | 'window';
  id: string;
  name: string;
}

type BaseScreenshotOptions = {
  type: 'screen' | 'window';
  id: string;
};

export type ScreenshotOptions =
  | (BaseScreenshotOptions & {
      type: 'screen';
      preset: unknown; // TODO: Implement preset system
    })
  | (BaseScreenshotOptions & { type: 'window' });
