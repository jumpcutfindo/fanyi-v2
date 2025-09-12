import { useEffect, useMemo } from 'react';

import { useGetUserPreferences } from '@renderer/features/preferences/queries/getUserPreferences.query';
import { useSetUserPreferenceMutation } from '@renderer/features/preferences/queries/setUserPreference.mutation';

export function useDarkMode() {
  const { data: userPreferences } = useGetUserPreferences();
  const { mutate: setUserPreference } = useSetUserPreferenceMutation();

  console.log(userPreferences);

  const isDarkMode = useMemo(() => {
    if (!userPreferences) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    console.log('memo', userPreferences);

    return userPreferences.isDarkMode;
  }, [userPreferences]);

  const setIsDarkMode = () => {
    console.log('update preference');
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
