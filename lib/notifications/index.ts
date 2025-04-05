import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType, NotificationData, getNotificationTitle, getNotificationBody } from './types';

// Konfigurera hur notifikationer ska presenteras för användaren
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Visa alert även om appen är i förgrunden
    shouldPlaySound: true, // Spela ljud
    shouldSetBadge: true, // Uppdatera app icon badge
  }),
});

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export { NotificationType, NotificationData, getNotificationTitle, getNotificationBody };

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Kontrollera om notiser är aktiverade av användaren i inställningarna
  const notificationsEnabled = await AsyncStorage.getItem('notifications');
  if (notificationsEnabled === 'false') {
    console.log('Notifikationer är inaktiverade i app-inställningarna');
    return undefined;
  }
  
  let token;
  
  // Kontrollera om vi kör på en fysisk enhet (inte emulatorn/simulatorn)
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Fråga efter behörighet om vi inte redan har det
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Om användaren inte gav behörighet, returnera
    if (finalStatus !== 'granted') {
      console.log('Behörighet för notiser saknas');
      return undefined;
    }

    // Projektspecifik identifierare från Expo för push notifications
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId || undefined,
    })).data;
    
    console.log('Push token:', token);
  } else {
    console.log('Push notifikationer kräver en fysisk enhet');
  }

  // För Android behöver vi konfigurera notifikationskanaler
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9956',
    });
    
    // Skapa separata kanaler för olika typer av notifikationer
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Beställningar',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#D4AF37', // Guldfärg
      description: 'Notifikationer relaterade till dina beställningar',
    });
    
    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Erbjudanden',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#4CAF50', // Grön
      description: 'Specialerbjudanden och kampanjer',
    });
    
    await Notifications.setNotificationChannelAsync('app_updates', {
      name: 'App-uppdateringar',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#2196F3', // Blå
      description: 'Information om app-uppdateringar',
    });
  }

  return token;
}

// Uppdatera användarens push-token i databasen
export async function updatePushToken(userId: string, token: string): Promise<void> {
  try {
    // Kolla om det finns en profil för användaren
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      throw profileError;
    }
    
    if (profileData) {
      // Uppdatera befintlig profil med push-token
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log('Push-token uppdaterad i profil');
    } else {
      console.error('Ingen profil hittades för användaren');
    }
  } catch (error) {
    console.error('Fel vid uppdatering av push-token:', error);
  }
}

// Hämta push-token för en specifik användare
export async function getUserPushToken(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return data?.push_token || null;
  } catch (error) {
    console.error('Fel vid hämtning av push-token:', error);
    return null;
  }
}

// Funktion för att bestämma korrekt Android-notifikationskanal
function getAndroidChannelId(notificationType: NotificationType): string {
  if (notificationType.startsWith('order_')) {
    return 'orders';
  } else if (notificationType.startsWith('promo_')) {
    return 'promotions';
  } else if (notificationType.startsWith('app_')) {
    return 'app_updates';
  }
  return 'default';
}

// Skicka typade notifikationer
export async function sendTypedNotification(
  token: string,
  notificationData: NotificationData
): Promise<boolean> {
  const title = getNotificationTitle(notificationData);
  const body = getNotificationBody(notificationData);
  
  let channel = 'default';
  if (Platform.OS === 'android') {
    channel = getAndroidChannelId(notificationData.type);
  }
  
  return await sendPushNotification(token, {
    title,
    body,
    data: {
      type: notificationData.type,
      ...notificationData.data,
      timestamp: notificationData.timestamp || Date.now(),
      androidChannelId: channel,
    }
  });
}

// Skicka push-notifikation till en specifik enhet
export async function sendPushNotification(
  token: string, 
  notification: PushNotification
): Promise<boolean> {
  try {
    const message = {
      to: token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      channelId: notification.data?.androidChannelId || 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('Notifikation skickad framgångsrikt');
    return true;
  } catch (error) {
    console.error('Fel vid sändning av push-notifikation:', error);
    return false;
  }
}

// Skicka orderstatusuppdatering till användaren
export async function sendOrderStatusNotification(
  userId: string, 
  orderId: string, 
  status: string
): Promise<boolean> {
  // Hämta användarens push-token
  const token = await getUserPushToken(userId);
  
  if (!token) {
    console.log(`Ingen push-token hittades för användare ${userId}`);
    return false;
  }
  
  let notificationType: NotificationType;
  
  // Mappa orderstatus till notifikationstyp
  switch (status) {
    case 'pending':
      notificationType = NotificationType.ORDER_PLACED;
      break;
    case 'processing':
      notificationType = NotificationType.ORDER_PROCESSING;
      break;
    case 'completed':
      notificationType = NotificationType.ORDER_COMPLETED;
      break;
    case 'cancelled':
      notificationType = NotificationType.ORDER_CANCELLED;
      break;
    default:
      notificationType = NotificationType.ORDER_PLACED;
  }
  
  // Skapa notifikationsdata
  const notificationData: NotificationData = {
    type: notificationType,
    timestamp: Date.now(),
    data: {
      orderId,
      orderStatus: status
    }
  };
  
  // Skicka notifikationen
  return await sendTypedNotification(token, notificationData);
} 