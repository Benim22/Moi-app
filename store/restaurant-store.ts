import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface RestaurantSettings {
  id?: string;
  name: string;
  description: string;
  logo_url?: string;
  open_hours: string;
  address: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  delivery_enabled: boolean;
  min_order_value: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  updated_at?: string;
}

interface RestaurantState {
  settings: RestaurantSettings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<RestaurantSettings>) => Promise<boolean>;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Moi Sushi',
  description: 'Högkvalitativ sushi i Stockholm',
  open_hours: 'Mån-Fre: 11-21, Lör: 12-21, Sön: 15-21',
  address: 'Sushigatan 123, 12345 Stockholm',
  website: 'www.moisushi.se',
  contact_email: 'info@moisushi.se',
  contact_phone: '08-123 45 67',
  delivery_enabled: true,
  min_order_value: 200,
  delivery_fee: 49,
  free_delivery_threshold: 500
};

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      error: null,
      
      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Hämta restauranginställningarna från Supabase
          const { data, error } = await supabase
            .from('restaurant_settings')
            .select('*')
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              // Ingen post hittades - använd standardinställningarna
              set({ settings: DEFAULT_SETTINGS, isLoading: false });
              return;
            }
            throw error;
          }
          
          if (data) {
            set({ settings: data as RestaurantSettings, isLoading: false });
          } else {
            set({ settings: DEFAULT_SETTINGS, isLoading: false });
          }
        } catch (error) {
          console.error('Error fetching restaurant settings:', error);
          set({ error: 'Kunde inte hämta restaurangens inställningar', isLoading: false });
        }
      },
      
      updateSettings: async (newSettings: Partial<RestaurantSettings>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentSettings = get().settings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          
          // Kolla om det finns en post i databasen
          const { data: existingData, error: checkError } = await supabase
            .from('restaurant_settings')
            .select('id')
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }
          
          let result;
          
          if (existingData) {
            // Uppdatera befintlig post
            result = await supabase
              .from('restaurant_settings')
              .update(updatedSettings)
              .eq('id', existingData.id);
          } else {
            // Skapa ny post
            result = await supabase
              .from('restaurant_settings')
              .insert(updatedSettings)
              .select();
          }
          
          if (result.error) throw result.error;
          
          set({ 
            settings: updatedSettings,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          console.error('Error updating restaurant settings:', error);
          set({ 
            error: 'Kunde inte uppdatera restaurangens inställningar', 
            isLoading: false 
          });
          return false;
        }
      },
      
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      }
    }),
    {
      name: 'restaurant-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 