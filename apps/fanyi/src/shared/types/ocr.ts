import { DictionaryEntry } from '@shared/types/dictionary';

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

export interface OcrResponse {
  ocrResult: OcrResult;
  translations: DictionaryEntry[];
}

interface IncomingModelReadyPayload {
  action: 'model_ready';
}

interface IncomingOcrResultPayload {
  action: 'ocr_result';
  data: OcrResult;
}

interface IncomingErrorPayload {
  action: 'error';
  message: string;
}

export interface IncomingLogPayload {
  type: 'info' | 'error' | 'debug';
  message: string;
}

export type IncomingDataPayload =
  | IncomingModelReadyPayload
  | IncomingOcrResultPayload
  | IncomingErrorPayload;

interface RunOcrCommandPayload {
  action: 'run_ocr';
  image_path: string;
}

interface ShutdownCommandPayload {
  action: 'shutdown';
}

interface EntryChangeCommandPayload {
  action: 'entry_change';
  type: 'add' | 'remove';
  entry: string;
}

export type OcrCommandPayload =
  | EntryChangeCommandPayload
  | RunOcrCommandPayload
  | ShutdownCommandPayload;
