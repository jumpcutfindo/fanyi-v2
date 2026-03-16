/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addScreenshotPreset,
  deleteScreenshotPreset,
  getScreenshotPresets,
  registerPresetKeybinds,
  updateScreenshotPreset,
} from './presets';

import { win } from '@main/main';
import * as keybinds from '@main/services/keybinds';
import { takeScreenshotWithPreset } from '@main/services/screenshot';

const { mockElectronStoreGet, mockElectronStoreSet } = vi.hoisted(() => ({
  mockElectronStoreGet: vi.fn(),
  mockElectronStoreSet: vi.fn(),
}));

vi.mock('electron-store', () => ({
  default: class {
    get = mockElectronStoreGet;
    set = mockElectronStoreSet;
  },
}));
vi.mock('uuid');
vi.mock('@main/services/keybinds');
vi.mock('@main/services/screenshot');
vi.mock('@main/logger');
vi.mock('@main/main', () => ({
  win: {
    webContents: {
      send: vi.fn(),
    },
  },
}));

describe('presets service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addScreenshotPreset', () => {
    it('should add a new preset and register its keybind', async () => {
      mockElectronStoreGet.mockReturnValue([]);

      const newPresetPayload = {
        name: 'Test Preset',
        type: 'custom' as const,
        description: 'Test Description',
        options: { type: 'screen' as const, sourceId: '1' },
        keybind: 'Ctrl+S',
      };

      await addScreenshotPreset(newPresetPayload);

      expect(keybinds.registerKeybind).toHaveBeenCalledWith(
        'Preset Test Preset',
        'Ctrl+S',
        expect.any(Function)
      );
    });
  });

  describe('getScreenshotPresets', () => {
    it('should return presets from store', async () => {
      const mockPresets = [{ id: '1', name: 'Preset 1' }];
      mockElectronStoreGet.mockReturnValue(mockPresets);

      const presets = await getScreenshotPresets();

      expect(presets).toEqual(mockPresets);
      expect(mockElectronStoreGet).toHaveBeenCalledWith('presets', []);
    });
  });

  describe('updateScreenshotPreset', () => {
    it('should update an existing preset and re-register keybind', async () => {
      const oldPreset = {
        id: '1',
        name: 'Old Name',
        keybind: 'Ctrl+O',
        type: 'custom' as const,
        description: '',
        options: { type: 'screen' as const, sourceId: '1' },
      };
      const updatedPreset = {
        ...oldPreset,
        name: 'New Name',
        keybind: 'Ctrl+N',
      };
      mockElectronStoreGet.mockReturnValue([oldPreset]);

      await updateScreenshotPreset(updatedPreset);

      expect(mockElectronStoreSet).toHaveBeenCalledWith('presets', [
        updatedPreset,
      ]);
      expect(keybinds.unregisterKeybind).toHaveBeenCalledWith('Ctrl+O');
      expect(keybinds.registerKeybind).toHaveBeenCalledWith(
        'Preset New Name',
        'Ctrl+N',
        expect.any(Function)
      );
    });
  });

  describe('deleteScreenshotPreset', () => {
    it('should delete a preset and unregister its keybind', async () => {
      const presetToDelete = {
        id: '1',
        name: 'To Delete',
        keybind: 'Ctrl+D',
        type: 'custom' as const,
        description: '',
        options: { type: 'screen' as const, sourceId: '1' },
      };
      mockElectronStoreGet.mockReturnValue([presetToDelete]);

      await deleteScreenshotPreset('1');

      expect(mockElectronStoreSet).toHaveBeenCalledWith('presets', []);
      expect(keybinds.unregisterKeybind).toHaveBeenCalledWith('Ctrl+D');
    });
  });

  describe('registerPresetKeybinds', () => {
    it('should register all presets with keybinds', async () => {
      const presets = [
        {
          id: '1',
          name: 'P1',
          keybind: 'K1',
          type: 'custom' as const,
          description: '',
          options: { type: 'screen' as const, sourceId: '1' },
        },
        {
          id: '2',
          name: 'P2',
          keybind: undefined,
          type: 'custom' as const,
          description: '',
          options: { type: 'screen' as const, sourceId: '1' },
        },
      ];
      mockElectronStoreGet.mockReturnValue(presets);

      await registerPresetKeybinds();

      expect(keybinds.registerKeybind).toHaveBeenCalledTimes(1);
      expect(keybinds.registerKeybind).toHaveBeenCalledWith(
        'Preset P1',
        'K1',
        expect.any(Function)
      );
    });
  });

  describe('keybind callback', () => {
    it('should take screenshot and send to window when triggered', async () => {
      const mockId = '1';

      const preset = {
        id: '1',
        name: 'Triggered',
        keybind: 'Ctrl+T',
        type: 'custom' as const,
        description: '',
        options: { type: 'screen' as const, sourceId: '1' },
      };
      const mockScreenshot = 'base64-data';
      (takeScreenshotWithPreset as any).mockResolvedValue(mockScreenshot);

      await addScreenshotPreset(preset);

      // Get the callback passed to registerKeybind
      const callback = (keybinds.registerKeybind as any).mock.calls[0][2];
      await callback();

      expect(takeScreenshotWithPreset).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockId })
      );
      expect(win?.webContents.send).toHaveBeenCalledWith(
        'trigger-screenshot-with-preset',
        mockId,
        mockScreenshot
      );
    });
  });
});
