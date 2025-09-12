import { useEffect, useState } from 'react';

export function useDarkMode() {
  // Use a state hook to manage the dark mode, defaulting to a system preference or light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check if a preference is already saved in local storage
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      return savedMode === 'dark';
    }
    // If not, check the user's system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // useEffect hook to handle the dark mode class on the html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
}
