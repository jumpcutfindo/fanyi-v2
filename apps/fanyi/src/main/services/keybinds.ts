import { globalShortcut } from 'electron';

/**
 * Contains reserved keybinds that may perform actions defined by the system
 */
const RESERVED_KEYBINDS: string[] = ['Ctrl + V'];

/**
 * Contains custom keybinds that are currently registered
 */
let registeredKeybinds: string[] = [];

export function getUsedKeybinds() {
  return [...RESERVED_KEYBINDS, ...registeredKeybinds];
}

function isKeybindAvailable(keybind: string) {
  return (
    RESERVED_KEYBINDS.includes(keybind) || !registeredKeybinds.includes(keybind)
  );
}

export function registerKeybind(keybind: string, fn: () => void) {
  if (!isKeybindAvailable(keybind)) {
    throw new Error(`Keybind ${keybind} is already in use`);
  }

  globalShortcut.register(keybind, fn);

  registeredKeybinds.push(keybind);
}

export function unregisterKeybind(keybind: string) {
  globalShortcut.unregister(keybind);

  registeredKeybinds = registeredKeybinds.filter((k) => k !== keybind);
}
