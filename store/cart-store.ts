import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '@/store/menu-store';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (menuItem: MenuItem) => {
        const { items } = get();
        const existingItem = items.find(item => item.menuItem.id === menuItem.id);
        
        if (existingItem) {
          set({
            items: items.map(item => 
              item.menuItem.id === menuItem.id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            )
          });
        } else {
          set({
            items: [...items, { id: menuItem.id, menuItem, quantity: 1 }]
          });
        }
      },
      
      removeFromCart: (id: string) => {
        const { items } = get();
        set({
          items: items.filter(item => item.id !== id)
        });
      },
      
      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          set({
            items: items.filter(item => item.id !== id)
          });
        } else {
          set({
            items: items.map(item => 
              item.id === id ? { ...item, quantity } : item
            )
          });
        }
      },
      
      increaseQuantity: (id: string) => {
        const { items } = get();
        set({
          items: items.map(item => 
            item.id === id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        });
      },
      
      decreaseQuantity: (id: string) => {
        const { items } = get();
        const item = items.find(item => item.id === id);
        
        if (item && item.quantity > 1) {
          set({
            items: items.map(item => 
              item.id === id 
                ? { ...item, quantity: item.quantity - 1 } 
                : item
            )
          });
        } else {
          // Om kvantiteten är 1, ta bort varan helt
          set({
            items: items.filter(item => item.id !== id)
          });
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'moi-sushi-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);