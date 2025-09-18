import { useEffect, useMemo } from 'react';

import { useGetUserPreferences } from '@shared/queries/getUserPreferences.query';
import { useSetUserPreferenceMutation } from '@shared/queries/setUserPreference.mutation';

export function useDarkMode() {
  const { data: userPreferences } = useGetUserPreferences();
  const { mutate: setUserPreference } = useSetUserPreferenceMutation();

  const isDarkMode = useMemo(() => {
    if (!userPreferences) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return userPreferences.isDarkMode;
  }, [userPreferences]);

  const setIsDarkMode = () => {
    setUserPreference({ key: 'isDarkMode', value: !isDarkMode });
  };

  // useEffect hook to handle the dark mode class on the html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
}
