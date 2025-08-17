import {
  ScreenshotOptions,
  ScreenshotPreset,
  ScreenshotSource,
} from "@shared/types/screenshot";
import { desktopCapturer } from "electron";

/**
 * Captures a screenshot of the primary screen and returns it as a Buffer.
 * @returns A Promise that resolves with the screenshot data as a Buffer.
 */
async function takeScreenshot(options: ScreenshotOptions): Promise<Buffer> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 2560, height: 1440 },
    });

    const source = sources.find((s) => s.id === options.sourceId);
    if (!source) {
      throw new Error("No screen found to capture.");
    }

    if (!options.crop) {
      return source.thumbnail.toPNG();
    } else {
      return source.thumbnail.crop(options.crop).toPNG();
    }
  } catch (err) {
    console.error("Failed to capture screenshot:", err);
    throw err;
  }
}

export async function takeScreenshotWithPreset(preset: ScreenshotPreset) {
  return takeScreenshot(preset.options);
}

export async function getScreenshotSources(): Promise<ScreenshotSource[]> {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 2560, height: 1440 },
  });

  return sources.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.id.includes("window") ? "window" : "screen",
    size: {
      width: s.thumbnail.getSize().width,
      height: s.thumbnail.getSize().height,
    },
  }));
}
