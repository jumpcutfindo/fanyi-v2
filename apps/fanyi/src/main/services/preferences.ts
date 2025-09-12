import Store from 'electron-store';

import { UserPreferences } from '@shared/types/preferences';

const preferencesStore = new Store<UserPreferences>({
  name: 'preferences',
});

export async function getPreferences(): Promise<UserPreferences> {
  return preferencesStore.get('preferences', { isDarkMode: false });
}

export async function setPreference(
  key: keyof UserPreferences,
  value: UserPreferences[keyof UserPreferences]
) {
  const preferences = await getPreferences();

  preferencesStore.set('preferences', { ...preferences, [key]: value });
}
