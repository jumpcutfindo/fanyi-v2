export function getBackgroundColor(isDarkMode: boolean) {
  if (isDarkMode) {
    return '#070b15';
  } else {
    return '#FFFFFF';
  }
}

export function getTitlebarStyle(isDarkMode: boolean) {
  if (isDarkMode) {
    return {
      color: '#FFFFFF00',
      symbolColor: '#FFFFFF',
      height: 35,
    };
  } else {
    return {
      color: '#FFFFFF00',
      symbolColor: '#000000',
      height: 35,
    };
  }
}
