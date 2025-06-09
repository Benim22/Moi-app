import { create } from 'zustand';
import { NotificationManager } from '@/utils/NotificationManager';
import { Platform } from 'react-native';

interface NotificationSettings {
  ordersEnabled: boolean;
  promosEnabled: boolean;
  remindersEnabled: boolean;
  loyaltyEnabled: boolean;
  pushTokenRegistered: boolean;
}

interface NotificationStore {
  // Inställningar
  settings: NotificationSettings;
  
  // Actions för inställningar
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  initializeNotifications: () => Promise<void>;
  savePushTokenForUser: (userId: string) => Promise<void>;
  
  // Push notification methods
  sendOrderConfirmation: (orderId: string, estimatedTime: number) => void;
  sendOrderReady: (orderId: string, isDelivery?: boolean) => void;
  sendLoyaltyReward: (pointsEarned: number, totalPoints: number) => void;
  sendPromoNotification: (title: string, message: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  settings: {
    ordersEnabled: true,
    promosEnabled: true,
    remindersEnabled: false,
    loyaltyEnabled: true,
    pushTokenRegistered: false,
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  initializeNotifications: async () => {
    try {
      // Skippa på web
      if (Platform.OS === 'web') {
        console.log('ℹ️ Push-notifikationer stöds inte på webben');
        return;
      }

      // Begär behörigheter
      const permitted = await NotificationManager.requestPermissions();
      
      if (permitted) {
        // Hämta push token
        const token = await NotificationManager.getPushToken();
        
        if (token) {
          // Spara push token till databasen för inloggad användare
          try {
            const { supabase } = await import('@/lib/supabase');
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              const { error } = await supabase
                .from('profiles')
                .update({ push_token: token })
                .eq('id', user.id);
              
              if (error) {
                console.error('❌ Fel vid sparande av push token:', error);
              } else {
                console.log('✅ Push token sparad för användare:', user.email);
              }
            }
          } catch (dbError) {
            console.error('❌ Fel vid databasoperation för push token:', dbError);
          }
          
          set((state) => ({
            settings: { ...state.settings, pushTokenRegistered: true },
          }));
          
          console.log('🔑 Push token registrerad:', token);
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

  savePushTokenForUser: async (userId: string) => {
    try {
      // Skippa på web
      if (Platform.OS === 'web') {
        console.log('ℹ️ Push token sparas inte på webben');
        return;
      }

      // Hämta push token
      const token = await NotificationManager.getPushToken();
      
      if (token && userId) {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', userId);
        
        if (error) {
          console.error('❌ Fel vid sparande av push token:', error);
        } else {
          console.log('✅ Push token sparad för användare:', userId);
          set((state) => ({
            settings: { ...state.settings, pushTokenRegistered: true },
          }));
        }
      }
    } catch (error) {
      console.error('❌ Fel vid sparande av push token:', error);
    }
  },

  // Push notification methods
  sendOrderConfirmation: (orderId, estimatedTime) => {
    const { settings } = get();
    
    if (settings.ordersEnabled) {
      NotificationManager.sendOrderConfirmation(orderId, estimatedTime);
    }
  },

  sendOrderReady: (orderId, isDelivery = false) => {
    const { settings } = get();
    
    if (settings.ordersEnabled) {
      NotificationManager.sendOrderReady(orderId, isDelivery);
    }
  },

  sendLoyaltyReward: (pointsEarned, totalPoints) => {
    const { settings } = get();
    
    if (settings.loyaltyEnabled) {
      NotificationManager.sendLoyaltyReward(pointsEarned, totalPoints);
    }
  },

  sendPromoNotification: (title, message) => {
    const { settings } = get();
    
    if (settings.promosEnabled) {
      // Skicka bara push notification
      NotificationManager.sendPromoNotification(title, message);
    }
  },
})); 