import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/store/menu-store';
import { useUserStore } from './user-store';

interface FavoriteItem {
  id: string;
  menu_item_id: string;
  user_id: string;
  created_at: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (menuItem: MenuItem) => Promise<void>;
  getFavorites: () => Promise<void>;
  isFavorite: (menuItemId: string) => boolean;
  addFavorite: (menuItem: MenuItem) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,
      
      toggleFavorite: async (menuItem: MenuItem) => {
        try {
          const { user } = useUserStore.getState();
          if (!user) {
            set({ error: 'Du måste vara inloggad för att spara favoriter' });
            return;
          }
          
          const existingFavorite = get().favorites.find(
            fav => fav.menu_item_id === menuItem.id && fav.user_id === user.id
          );
          
          if (existingFavorite) {
            // Ta bort från favoriter
            await get().removeFavorite(existingFavorite.id);
          } else {
            // Lägg till i favoriter
            await get().addFavorite(menuItem);
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          set({ error: 'Kunde inte uppdatera favoriter' });
        }
      },
      
      isFavorite: (menuItemId: string) => {
        const { user } = useUserStore.getState();
        if (!user) return false;
        
        return get().favorites.some(
          fav => fav.menu_item_id === menuItemId && fav.user_id === user.id
        );
      },
      
      addFavorite: async (menuItem: MenuItem) => {
        try {
          const { user } = useUserStore.getState();
          if (!user) {
            set({ error: 'Du måste vara inloggad för att spara favoriter' });
            return;
          }
          
          const { data, error } = await supabase
            .from('favorites')
            .insert([
              {
                menu_item_id: menuItem.id,
                user_id: user.id
              }
            ])
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            favorites: [...state.favorites, data]
          }));
          
          console.log('Favorit sparad:', data);
        } catch (error) {
          console.error('Error adding favorite:', error);
          set({ error: 'Kunde inte lägga till favorit' });
        }
      },
      
      removeFavorite: async (favoriteId: string) => {
        try {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favoriteId);
            
          if (error) throw error;
          
          set(state => ({
            favorites: state.favorites.filter(fav => fav.id !== favoriteId)
          }));
          
          console.log('Favorit borttagen:', favoriteId);
        } catch (error) {
          console.error('Error removing favorite:', error);
          set({ error: 'Kunde inte ta bort favorit' });
        }
      },
      
      getFavorites: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { user } = useUserStore.getState();
          
          if (!user) {
            set({ favorites: [], isLoading: false });
            return;
          }
          
          const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          set({ favorites: data || [], isLoading: false });
          console.log('Hämtade favoriter:', data);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          set({ error: 'Kunde inte hämta favoriter', isLoading: false });
        }
      }
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);