import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { registerForPushNotificationsAsync, updatePushToken } from '@/lib/notifications';

interface NotificationsManagerProps {
  children: React.ReactNode;
}

export default function NotificationsManager({ children }: NotificationsManagerProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useUserStore();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Registrera för notifikationer och uppdatera token i databasen när användaren loggar in
    if (isLoggedIn && user) {
      registerPushNotifications();
    }

    // Lyssna på ändringar i appens tillstånd
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, user]);

  const handleAppStateChange = (nextAppState: string) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App har kommit i förgrunden!');
      // Uppdatera token när appen kommer tillbaka i förgrunden
      if (isLoggedIn && user) {
        registerPushNotifications();
      }
    }

    appState.current = nextAppState;
  };

  const registerPushNotifications = async () => {
    try {
      // Registrera för notifikationer och hämta token
      const token = await registerForPushNotificationsAsync();
      
      if (token && user) {
        setExpoPushToken(token);
        // Uppdatera token i databasen
        await updatePushToken(user.id, token);
      }
    } catch (error) {
      console.log('Fel vid registrering för notifikationer:', error);
    }

    // Konfigurera notifikationshanterare
    setupNotificationListeners();
  };

  const setupNotificationListeners = () => {
    // Städa upp tidigare lyssnare
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }

    // Lyssna på inkommande notifikationer
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notifikation mottagen i förgrunden!', notification);
      setNotification(notification);
    });

    // Lyssna på interaktion med notifikationer
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notifikation klickad!', response);
      
      const data = response.notification.request.content.data;
      
      // Navigera baserat på data i notifikationen
      if (data.orderId) {
        router.push(`/order-details/${data.orderId}`);
      }
    });
  };

  useEffect(() => {
    return () => {
      // Städa upp alla lyssnare när komponenten avmonteras
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Denna komponent renderar inga egna UI-element, bara sina barn
  return <>{children}</>;
} 