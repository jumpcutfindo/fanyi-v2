import { globalShortcut } from 'electron';

/**
 * Contains reserved keybinds that may perform actions defined by the system
 */
const defaultKeybindToFnMap: Record<string, () => void> = {
  'Ctrl + V': () => {},
};

/**
 * Contains keybinds registered by the user
 */
const customKeybindToFnMap: Record<string, () => void> = {};

let isKeybindsDisabled: boolean = false;

export function getUsedKeybinds(): string[] {
  return [
    ...Object.keys(defaultKeybindToFnMap),
    ...Object.keys(customKeybindToFnMap),
  ];
}

function isKeybindAvailable(keybind: string) {
  return !getUsedKeybinds().includes(keybind);
}

export function registerKeybind(keybind: string, fn: () => void) {
  if (!isKeybindAvailable(keybind)) {
    throw new Error(`Keybind ${keybind} is already in use`);
  }

  globalShortcut.register(keybind, fn);
  customKeybindToFnMap[keybind] = fn;
}

export function unregisterKeybind(keybind: string) {
  globalShortcut.unregister(keybind);

  delete customKeybindToFnMap[keybind];
}

export function enableKeybinds() {
  if (isKeybindsDisabled) {
    for (const keybind in customKeybindToFnMap) {
      globalShortcut.register(keybind, customKeybindToFnMap[keybind]);
    }

    isKeybindsDisabled = false;
  }
}

export function disableKeybinds() {
  if (!isKeybindsDisabled) {
    for (const keybind in customKeybindToFnMap) {
      globalShortcut.unregister(keybind);
    }

    isKeybindsDisabled = true;
  }
}
