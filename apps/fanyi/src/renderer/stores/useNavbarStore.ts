import { create } from 'zustand';

type NavbarState = 'screenshot' | 'dictionaries';

interface NavbarStore {
  navbarState: NavbarState;
  setNavbarState: (state: NavbarState) => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
  navbarState: 'screenshot',
  setNavbarState: (navbarState) => set(() => ({ navbarState })),
}));
