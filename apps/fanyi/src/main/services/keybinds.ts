import { globalShortcut } from 'electron';

import { logger } from '@main/logger';

/**
 * Contains reserved keybinds that may perform actions defined by the system
 */
const defaultKeybindToFnMap: Record<string, () => void> = {};

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

export function registerDefaultKeybinds() {
  for (const keybind in defaultKeybindToFnMap) {
    globalShortcut.register(keybind, defaultKeybindToFnMap[keybind]);
    logger.debug(`Registered default keybind ${keybind}`);
  }
}

export function registerKeybind(keybind: string, fn: () => void) {
  if (!isKeybindAvailable(keybind)) {
    throw new Error(`Keybind ${keybind} is already in use`);
  }

  globalShortcut.register(keybind, fn);
  customKeybindToFnMap[keybind] = fn;

  logger.debug(`Registered custom keybind ${keybind}`);
}

export function unregisterKeybind(keybind: string) {
  globalShortcut.unregister(keybind);

  delete customKeybindToFnMap[keybind];

  logger.debug(`Unregistered custom keybind ${keybind}`);
}

export function enableKeybinds() {
  logger.debug('Enabling keybinds');
  if (isKeybindsDisabled) {
    for (const keybind in customKeybindToFnMap) {
      globalShortcut.register(keybind, customKeybindToFnMap[keybind]);
    }

    isKeybindsDisabled = false;
  }
}

export function disableKeybinds() {
  logger.debug('Disabling keybinds');
  if (!isKeybindsDisabled) {
    for (const keybind in customKeybindToFnMap) {
      globalShortcut.unregister(keybind);
    }

    isKeybindsDisabled = true;
  }
}
