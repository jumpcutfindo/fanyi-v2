/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalShortcut } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  globalShortcut: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
}));

vi.mock('@main/logger');

describe('keybinds service', () => {
  let keybinds: typeof import('./keybinds');

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    keybinds = await import('./keybinds');
  });

  describe('registerKeybind', () => {
    it('should register a keybind successfully', () => {
      const fn = vi.fn();
      keybinds.registerKeybind('Test Label', 'Ctrl+S', fn);

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+S', fn);
      expect(keybinds.getUsedKeybinds()).toContain('Ctrl+S');
    });

    it('should throw an error if keybind is already registered', () => {
      keybinds.registerKeybind('First', 'Ctrl+S', () => {});

      expect(() => {
        keybinds.registerKeybind('Second', 'Ctrl+S', () => {});
      }).toThrow('Keybind Ctrl+S is already in use');
    });
  });

  describe('unregisterKeybind', () => {
    it('should unregister a keybind successfully', () => {
      keybinds.registerKeybind('Test', 'Ctrl+S', () => {});
      keybinds.unregisterKeybind('Ctrl+S');

      expect(globalShortcut.unregister).toHaveBeenCalledWith('Ctrl+S');
      expect(keybinds.getUsedKeybinds()).not.toContain('Ctrl+S');
    });
  });

  describe('disableKeybinds / enableKeybinds', () => {
    it('should unregister all custom keybinds when disabled', () => {
      keybinds.registerKeybind('P1', 'Ctrl+1', () => {});
      keybinds.registerKeybind('P2', 'Ctrl+2', () => {});

      vi.clearAllMocks();
      keybinds.disableKeybinds();

      expect(globalShortcut.unregister).toHaveBeenCalledWith('Ctrl+1');
      expect(globalShortcut.unregister).toHaveBeenCalledWith('Ctrl+2');
      expect(globalShortcut.unregister).toHaveBeenCalledTimes(2);
    });

    it('should register back all custom keybinds when enabled', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      keybinds.registerKeybind('P1', 'Ctrl+1', fn1);
      keybinds.registerKeybind('P2', 'Ctrl+2', fn2);

      keybinds.disableKeybinds();
      vi.clearAllMocks();

      keybinds.enableKeybinds();

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+1', fn1);
      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+2', fn2);
      expect(globalShortcut.register).toHaveBeenCalledTimes(2);
    });

    it('should be idempotent', () => {
      keybinds.registerKeybind('P1', 'Ctrl+1', () => {});
      keybinds.disableKeybinds();
      vi.clearAllMocks();

      keybinds.disableKeybinds(); // Call again - should not call unregister again
      expect(globalShortcut.unregister).not.toHaveBeenCalled();

      keybinds.enableKeybinds();
      vi.clearAllMocks();

      keybinds.enableKeybinds(); // Call again - should not call register again
      expect(globalShortcut.register).not.toHaveBeenCalled();
    });
  });

  describe('getUsedKeybinds', () => {
    it('should return all used keybinds', () => {
      keybinds.registerKeybind('P1', 'Ctrl+1', () => {});
      keybinds.registerKeybind('P2', 'Ctrl+2', () => {});

      const used = keybinds.getUsedKeybinds();
      expect(used).toHaveLength(2);
      expect(used).toContain('Ctrl+1');
      expect(used).toContain('Ctrl+2');
    });
  });
});
