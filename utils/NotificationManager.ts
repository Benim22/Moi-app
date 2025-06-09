import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface NotificationData {
  type: 'order' | 'promo' | 'reminder' | 'loyalty';
  orderId?: string;
  promoCode?: string;
  deepLink?: string;
  [key: string]: any;
}

export interface ScheduledNotification {
  title: string;
  body: string;
  data?: NotificationData;
  trigger?: Notifications.NotificationTriggerInput;
}

// Konfiguration för hur notifikationer ska visas
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as NotificationData;
    
    // Olika hantering baserat på notifikationstyp
    switch (data?.type) {
      case 'order':
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        };
      case 'promo':
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        };
      case 'reminder':
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
        };
      case 'loyalty':
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        };
      default:
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
    }
  },
});

export class NotificationManager {
  private static pushToken: string | null = null;
  
  // Begär notifikationsbehörigheter
  static async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('📱 Notifikationer fungerar bara på riktiga enheter');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notifikationsbehörigheter nekade');
        return false;
      }

      // Konfigurera notifikationskanal för Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('moi-orders', {
          name: 'Beställningar',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFD700',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('moi-promos', {
          name: 'Erbjudanden',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 100, 100, 100],
          lightColor: '#FFD700',
        });

        await Notifications.setNotificationChannelAsync('moi-reminders', {
          name: 'Påminnelser',
          importance: Notifications.AndroidImportance.LOW,
        });

        await Notifications.setNotificationChannelAsync('moi-loyalty', {
          name: 'Belöningar',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 150, 150, 150],
          lightColor: '#FFD700',
        });
      }

      console.log('✅ Notifikationsbehörigheter beviljade');
      return true;
    } catch (error) {
      console.error('❌ Fel vid begäran om notifikationsbehörigheter:', error);
      return false;
    }
  }

  // Hämta push token för push notifications
  static async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('⚠️ Expo projekt ID saknas');
        return null;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = pushTokenData.data;
      console.log('🔑 Push token erhållen:', this.pushToken);
      
      return this.pushToken;
    } catch (error) {
      console.error('❌ Fel vid hämtning av push token:', error);
      return null;
    }
  }

  // Skicka push-notifikation till specifik token via Expo Push API
  static async sendPushNotificationToToken(
    pushToken: string, 
    payload: {
      title: string;
      body: string;
      data?: Record<string, any>;
      sound?: boolean;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<void> {
    try {
      const message = {
        to: pushToken,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound ? 'default' : undefined,
        priority: payload.priority === 'high' ? 'high' : 'normal',
        channelId: this.getChannelForNotificationType(payload.data?.type || 'default'),
      };

      // Skicka via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      
      if (result.data && result.data.status === 'ok') {
        console.log('✅ Push-notifikation skickad via Expo API');
      } else {
        console.error('❌ Fel från Expo Push API:', result);
      }
    } catch (error) {
      console.error('❌ Fel vid skicka push-notifikation:', error);
    }
  }

  // Hjälpmetod för att få rätt notifikationskanal
  private static getChannelForNotificationType(type: string): string {
    switch (type) {
      case 'order':
      case 'order_status':
      case 'booking':
        return 'moi-orders';
      case 'promo':
        return 'moi-promos';
      case 'reminder':
        return 'moi-reminders';
      case 'loyalty':
        return 'moi-loyalty';
      default:
        return 'moi-orders';
    }
  }

  // Skicka lokal notifikation omedelbart
  static async sendLocalNotification(notification: ScheduledNotification): Promise<string | null> {
    try {
      // Hantera sound-fältet korrekt
      let soundValue: boolean | string | undefined = undefined;
      
      if (notification.data?.sound === true) {
        soundValue = 'default';
      } else if (typeof notification.data?.sound === 'string') {
        soundValue = notification.data.sound;
      } else if (notification.data?.sound === false) {
        soundValue = false;
      } else if (notification.data?.type === 'order') {
        soundValue = 'default';
      }

      // Lägg till Moi-logotyp för iOS notifikationer
      let attachments: Notifications.NotificationAttachment[] = [];
      
      if (Platform.OS === 'ios') {
        try {
          attachments = [{
            identifier: 'moi-logo',
            url: '../assets/images/moi-notification-icon.png',
            options: {
              typeHint: 'public.png',
              thumbnailHidden: false,
              thumbnailClippingRect: { x: 0, y: 0, width: 1, height: 1 },
              thumbnailTime: 0,
            },
          }];
        } catch (error) {
          console.log('⚠️ Kunde inte lägga till notifikationsbild:', error);
        }
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: soundValue,
          attachments: attachments,
        },
        trigger: notification.trigger || null, // null = omedelbart
      });

      console.log('📲 Lokal notifikation skickad:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Fel vid sändning av lokal notifikation:', error);
      return null;
    }
  }

  // Schemalägg framtida notifikation
  static async scheduleNotification(
    notification: ScheduledNotification,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger,
      });

      console.log('⏰ Notifikation schemalagd:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Fel vid schemaläggning av notifikation:', error);
      return null;
    }
  }

  // Förinställda notifikationstyper för Moi Sushi
  static async sendOrderConfirmation(orderId: string, estimatedTime: number): Promise<void> {
    await this.sendLocalNotification({
      title: '🍣 Moi Sushi - Beställning bekräftad!',
      body: `Din beställning #${orderId} är mottagen. Beräknad tid: ${estimatedTime} min`,
      data: {
        type: 'order',
        orderId,
        deepLink: `moi://order/${orderId}`,
      },
    });
  }

  static async sendOrderReady(orderId: string, isDelivery: boolean = false): Promise<void> {
    const message = isDelivery 
      ? 'Din beställning är klar och leveransen har påbörjats!'
      : 'Din beställning är klar för avhämtning!';

    await this.sendLocalNotification({
      title: '🎉 Moi Sushi - Maten är klar!',
      body: message,
      data: {
        type: 'order',
        orderId,
        deepLink: `moi://order/${orderId}`,
      },
    });
  }

  static async sendPromotion(title: string, message: string, promoCode?: string): Promise<void> {
    await this.sendLocalNotification({
      title: `🎯 Moi Sushi - ${title}`,
      body: message,
      data: {
        type: 'promo',
        promoCode,
        deepLink: 'moi://menu',
      },
    });
  }

  static async sendLoyaltyReward(pointsEarned: number, totalPoints: number): Promise<void> {
    await this.sendLocalNotification({
      title: '🏆 Moi Sushi - Poäng intjänade!',
      body: `Du fick ${pointsEarned} poäng! Totalt: ${totalPoints} poäng`,
      data: {
        type: 'loyalty',
        deepLink: 'moi://profile/loyalty',
      },
    });
  }

  static async scheduleLunchReminder(): Promise<void> {
    // Schemalägg påminnelse för lunch varje vardag kl 11:30
    await this.scheduleNotification(
      {
        title: '🍽️ Moi Sushi - Dags för lunch?',
        body: 'Upptäck dagens specialerbjudanden från Moi Sushi!',
        data: {
          type: 'reminder',
          deepLink: 'moi://menu',
        },
      },
      {
        type: 'calendar',
        repeats: true,
        hour: 11,
        minute: 30,
        weekday: [2, 3, 4, 5, 6], // Måndag-Fredag
      }
    );
  }

  // Avboka schemalagda notifikationer
  static async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Rensa alla levererade notifikationer från notifikationscenter
  static async clearAllDeliveredNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Hämta alla schemalagda notifikationer
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
} 