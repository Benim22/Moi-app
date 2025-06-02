import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '@/store/menu-store';
import { useNotificationStore } from '@/store/notification-store';

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
  checkout: () => void;
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

        // Visa notifikation när produkt läggs till
        const totalItems = get().getTotalItems();
        useNotificationStore.getState().showSuccess(
          'Tillagd i kundkorgen! 🛒',
          `${menuItem.name} har lagts till. Totalt: ${totalItems} produkter`,
          {
            label: 'Visa kundkorg',
            onPress: () => {
              // Navigera till cart - implementation kommer senare
              console.log('Navigera till kundkorg');
            },
          }
        );
      },
      
      removeFromCart: (id: string) => {
        const { items } = get();
        const removedItem = items.find(item => item.id === id);
        
        set({
          items: items.filter(item => item.id !== id)
        });

        // Visa notifikation när produkt tas bort
        if (removedItem) {
          useNotificationStore.getState().showInfo(
            'Borttagen från kundkorgen',
            `${removedItem.menuItem.name} har tagits bort`
          );
        }
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
        
        // Visa notifikation när kundkorgen rensas
        useNotificationStore.getState().showInfo(
          'Kundkorg rensad',
          'Alla produkter har tagits bort från kundkorgen'
        );
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      checkout: () => {
        const { items } = get();
        const orderId = Date.now().toString();
        const totalPrice = get().getTotalPrice();
        
        // Simulera checkout-process
        useNotificationStore.getState().showOrderConfirmation(orderId, 25);
        
        // Rensa kundkorgen efter checkout
        set({ items: [] });
        
        // Simulera order ready efter 3 sekunder (för demo)
        setTimeout(() => {
          useNotificationStore.getState().showOrderReady(orderId, false);
        }, 3000);

        // Simulera loyalty points efter 5 sekunder (för demo)
        setTimeout(() => {
          const pointsEarned = Math.floor(totalPrice / 10); // 1 poäng per 10kr
          useNotificationStore.getState().showLoyaltyReward(pointsEarned, pointsEarned + 45);
        }, 5000);
      }
    }),
    {
      name: 'moi-sushi-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);