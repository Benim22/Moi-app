import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: true,
      darkMode: false,
      language: 'Svenska',
      
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'moi-sushi-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);