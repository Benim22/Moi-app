import { create } from 'zustand';
import { NotificationType } from '@/components/InAppNotification';
import { NotificationManager } from '@/utils/NotificationManager';

interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  visible: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationSettings {
  ordersEnabled: boolean;
  promosEnabled: boolean;
  remindersEnabled: boolean;
  loyaltyEnabled: boolean;
  pushTokenRegistered: boolean;
}

interface NotificationStore {
  // In-app notifikationer
  notifications: InAppNotification[];
  
  // Inställningar
  settings: NotificationSettings;
  
  // Actions för in-app notifikationer
  showNotification: (notification: Omit<InAppNotification, 'id' | 'visible'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions för inställningar
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  initializeNotifications: () => Promise<void>;
  
  // Fördefinierade notifikationstyper
  showSuccess: (title: string, message: string, action?: InAppNotification['action']) => void;
  showError: (title: string, message: string, action?: InAppNotification['action']) => void;
  showInfo: (title: string, message: string, action?: InAppNotification['action']) => void;
  showPromo: (title: string, message: string, action?: InAppNotification['action']) => void;
  
  // Order-specifika notifikationer
  showOrderConfirmation: (orderId: string, estimatedTime: number) => void;
  showOrderReady: (orderId: string, isDelivery?: boolean) => void;
  
  // Loyalty notifikationer
  showLoyaltyReward: (pointsEarned: number, totalPoints: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  settings: {
    ordersEnabled: true,
    promosEnabled: true,
    remindersEnabled: false,
    loyaltyEnabled: true,
    pushTokenRegistered: false,
  },

  showNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: InAppNotification = {
      ...notification,
      id,
      visible: true,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  initializeNotifications: async () => {
    try {
      // Begär behörigheter
      const permitted = await NotificationManager.requestPermissions();
      
      if (permitted) {
        // Hämta push token
        const token = await NotificationManager.getPushToken();
        
        if (token) {
          set((state) => ({
            settings: { ...state.settings, pushTokenRegistered: true },
          }));
          
          // Här skulle du skicka token till din backend
          console.log('🔑 Push token att spara i backend:', token);
        }

        // Schemalägg återkommande påminnelser om användaren vill
        const { settings } = get();
        if (settings.remindersEnabled) {
          await NotificationManager.scheduleLunchReminder();
        }
      }
    } catch (error) {
      console.error('❌ Fel vid initiering av notifikationer:', error);
    }
  },

  // Fördefinierade notifikationstyper
  showSuccess: (title, message, action) => {
    get().showNotification({ type: 'success', title, message, action });
  },

  showError: (title, message, action) => {
    get().showNotification({ type: 'error', title, message, action });
  },

  showInfo: (title, message, action) => {
    get().showNotification({ type: 'info', title, message, action });
  },

  showPromo: (title, message, action) => {
    const { settings } = get();
    if (settings.promosEnabled) {
      get().showNotification({ type: 'promo', title, message, action });
    }
  },

  // Order-specifika notifikationer
  showOrderConfirmation: (orderId, estimatedTime) => {
    const { settings } = get();
    
    if (settings.ordersEnabled) {
      // In-app notifikation
      get().showSuccess(
        'Beställning bekräftad! 🍣',
        `Beställning #${orderId} mottagen. Beräknad tid: ${estimatedTime} min`,
        {
          label: 'Visa beställning',
          onPress: () => {
            // Navigera till order screen
            console.log('Navigera till order:', orderId);
          },
        }
      );

      // Push notifikation
      NotificationManager.sendOrderConfirmation(orderId, estimatedTime);
    }
  },

  showOrderReady: (orderId, isDelivery = false) => {
    const { settings } = get();
    
    if (settings.ordersEnabled) {
      const message = isDelivery 
        ? 'Din beställning är klar och leveransen har påbörjats!'
        : 'Din beställning är klar för avhämtning!';

      // In-app notifikation
      get().showSuccess(
        'Maten är klar! 🎉',
        message,
        {
          label: 'Visa detaljer',
          onPress: () => {
            console.log('Visa order detaljer:', orderId);
          },
        }
      );

      // Push notifikation
      NotificationManager.sendOrderReady(orderId, isDelivery);
    }
  },

  showLoyaltyReward: (pointsEarned, totalPoints) => {
    const { settings } = get();
    
    if (settings.loyaltyEnabled) {
      // In-app notifikation
      get().showNotification({
        type: 'promo',
        title: 'Poäng intjänade! 🏆',
        message: `Du fick ${pointsEarned} poäng! Totalt: ${totalPoints} poäng`,
        action: {
          label: 'Visa belöningar',
          onPress: () => {
            console.log('Navigera till loyalty screen');
          },
        },
      });

      // Push notifikation
      NotificationManager.sendLoyaltyReward(pointsEarned, totalPoints);
    }
  },
})); 