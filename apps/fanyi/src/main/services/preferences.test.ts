/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Import after mocking
import {
  addPreferenceChangeListener,
  getPreferences,
  setPreference,
} from './preferences';

const { mockGet, mockSet, mockOnDidAnyChange } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
  mockOnDidAnyChange: vi.fn(),
}));

vi.mock('electron-store', () => ({
  default: class {
    get = mockGet;
    set = mockSet;
    onDidAnyChange = mockOnDidAnyChange;
  },
}));

describe('preferences service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should return stored preferences when they exist', async () => {
      const storedPrefs = {
        isDarkMode: true,
        isWrapTabs: true,
        examplePreference: 123,
      };
      mockGet.mockReturnValue(storedPrefs);

      const prefs = await getPreferences();

      expect(prefs).toEqual(storedPrefs);
    });
  });

  describe('setPreference', () => {
    it('should update a single preference while preserving others', async () => {
      const initialPrefs = {
        isDarkMode: false,
        isWrapTabs: false,
      };
      mockGet.mockReturnValue(initialPrefs);

      await setPreference('isDarkMode', true);

      expect(mockSet).toHaveBeenCalledWith('preferences', {
        isDarkMode: true,
        isWrapTabs: false,
      });
    });
  });

  describe('addPreferenceChangeListener', () => {
    it('should register a listener that extracts preferences from the change object', () => {
      const mockUnsubscribe = vi.fn();
      mockOnDidAnyChange.mockReturnValue(mockUnsubscribe);

      const listener = vi.fn();
      const result = addPreferenceChangeListener(listener);

      expect(result).toBe(mockUnsubscribe);
      expect(mockOnDidAnyChange).toHaveBeenCalled();

      // Trigger the internal callback
      const internalCallback = mockOnDidAnyChange.mock.calls[0][0];
      const mockParams = {
        preferences: { isDarkMode: true, isWrapTabs: false },
      };

      internalCallback(mockParams);

      expect(listener).toHaveBeenCalledWith(mockParams.preferences);
    });
  });
});
