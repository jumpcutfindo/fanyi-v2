export type OcrStatus = 'startup' | 'available' | 'unavailable' | 'shutdown';

interface OcrResultItem {
  coordinates: number[][];
  text: string;
  confidence: number;
}

export interface OcrResult {
  results: OcrResultItem[];
  segmented_text: string[];
}
