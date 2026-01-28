import { globalShortcut } from 'electron';

import { Keybind } from '@shared/types/keybind';
import { logger } from '@main/logger';

/**
 * Contains reserved keybinds that may perform actions defined by the system
 */
const defaultKeybindToFnMap: Record<string, Keybind> = {};

/**
 * Contains keybinds registered by the user
 */
const customKeybindToFnMap: Record<string, Keybind> = {};

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
    globalShortcut.register(keybind, defaultKeybindToFnMap[keybind].keybindFn);
    logger.debug(
      `Registered default keybind "${defaultKeybindToFnMap[keybind].label}" ${keybind}`
    );
  }
}

export function registerKeybind(label: string, keys: string, fn: () => void) {
  if (!isKeybindAvailable(keys)) {
    throw new Error(`Keybind ${keys} is already in use`);
  }

  globalShortcut.register(keys, fn);
  customKeybindToFnMap[keys] = {
    label,
    keybindFn: fn,
  };

  logger.debug(`Registered custom keybind "${label}" (${keys})`);
}

export function unregisterKeybind(keys: string) {
  globalShortcut.unregister(keys);

  const keybind = customKeybindToFnMap[keys];
  delete customKeybindToFnMap[keys];

  logger.debug(`Unregistered custom keybind "${keybind?.label}" (${keys})`);
}

export function enableKeybinds() {
  logger.debug('Enabling keybinds');
  if (isKeybindsDisabled) {
    for (const keybind in customKeybindToFnMap) {
      globalShortcut.register(keybind, customKeybindToFnMap[keybind].keybindFn);
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
