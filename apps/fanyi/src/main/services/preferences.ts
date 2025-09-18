import Store from 'electron-store';

import { UserPreferences } from '@shared/types/preferences';

export const preferencesStore = new Store<UserPreferences>({
  name: 'preferences',
  watch: true,
});

export async function getPreferences(): Promise<UserPreferences> {
  return preferencesStore.get('preferences', {
    isDarkMode: false,
    isWrapTabs: false,
  });
}

export async function setPreference(
  key: keyof UserPreferences,
  value: UserPreferences[keyof UserPreferences]
) {
  const preferences = await getPreferences();

  preferencesStore.set('preferences', { ...preferences, [key]: value });
}

export function addPreferenceChangeListener(
  listener: Parameters<(typeof preferencesStore)['onDidAnyChange']>[0]
) {
  return preferencesStore.onDidAnyChange((params) =>
    // @ts-expect-error Somehow the type is not correct, access it correctly here
    // The library assumes that the params passed is the `preferences` object
    // However, we are getting something like `{ preferences: { ... } }`
    listener(params.preferences)
  );
}
