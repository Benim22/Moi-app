import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '@/store/user-store';
import { 
  sendPushNotification, 
  getUserPushToken, 
  sendTypedNotification,
  NotificationType,
  NotificationData
} from '@/lib/notifications';
import { theme } from '@/constants/theme';

export default function TestNotifications() {
  const { user } = useUserStore();

  const scheduleLocalNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test av lokal notifikation',
          body: 'Detta är en lokal notifikation som testas',
          data: { screen: 'settings' },
        },
        trigger: {
          seconds: 2, // Visa efter 2 sekunder
        },
      });
      Alert.alert('Framgång', 'Lokal notifikation schemalagd');
    } catch (error) {
      console.error('Fel vid schemaläggning av notifikation:', error);
      Alert.alert('Fel', 'Kunde inte schemalägga notifikation');
    }
  };

  const testPushNotification = async () => {
    if (!user) {
      Alert.alert('Fel', 'Du måste vara inloggad för att testa push-notifikationer');
      return;
    }

    try {
      const token = await getUserPushToken(user.id);
      
      if (!token) {
        Alert.alert('Fel', 'Ingen push-token hittades för din användare');
        return;
      }
      
      const success = await sendPushNotification(token, {
        title: 'Test av push-notifikation',
        body: 'Detta är en push-notifikation som skickas via Expo Push Service',
        data: { screen: 'settings', test: true },
      });
      
      if (success) {
        Alert.alert('Framgång', 'Push-notifikation skickad');
      } else {
        Alert.alert('Fel', 'Kunde inte skicka push-notifikation');
      }
    } catch (error) {
      console.error('Fel vid test av push-notifikation:', error);
      Alert.alert('Fel', 'Kunde inte skicka push-notifikation');
    }
  };
  
  // Testa olika typer av typade notifikationer
  const testTypedNotification = async (type: NotificationType) => {
    if (!user) {
      Alert.alert('Fel', 'Du måste vara inloggad för att testa notifikationer');
      return;
    }

    try {
      const token = await getUserPushToken(user.id);
      
      if (!token) {
        Alert.alert('Fel', 'Ingen push-token hittades för din användare');
        return;
      }
      
      // Skapa notifikationsdata
      const notificationData: NotificationData = {
        type,
        timestamp: Date.now(),
        data: {
          orderId: '12345678-abcd-1234-efgh-123456789012',
          discount: '15%',
          promoCode: 'MOI15',
          message: 'Fantastiska sushirätter till kampanjpris denna vecka!',
          appVersion: '1.1.0'
        }
      };
      
      const success = await sendTypedNotification(token, notificationData);
      
      if (success) {
        Alert.alert('Framgång', `Typnotifikation (${type}) skickad`);
      } else {
        Alert.alert('Fel', 'Kunde inte skicka typnotifikation');
      }
    } catch (error) {
      console.error('Fel vid test av typnotifikation:', error);
      Alert.alert('Fel', 'Kunde inte skicka typnotifikation');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Testa notifikationer</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={scheduleLocalNotification}
      >
        <Text style={styles.buttonText}>Testa lokal notifikation</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={testPushNotification}
      >
        <Text style={styles.buttonText}>Testa push-notifikation</Text>
      </TouchableOpacity>
      
      <Text style={styles.subtitle}>Olika typer av notifikationer:</Text>
      
      <ScrollView style={styles.scrollContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.orderButton]}
          onPress={() => testTypedNotification(NotificationType.ORDER_COMPLETED)}
        >
          <Text style={styles.buttonText}>Order klar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.orderButton]}
          onPress={() => testTypedNotification(NotificationType.ORDER_PROCESSING)}
        >
          <Text style={styles.buttonText}>Order tillagas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.promoButton]}
          onPress={() => testTypedNotification(NotificationType.PROMO_DISCOUNT)}
        >
          <Text style={styles.buttonText}>Rabatterbjudande</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.promoButton]}
          onPress={() => testTypedNotification(NotificationType.PROMO_NEW)}
        >
          <Text style={styles.buttonText}>Ny produkt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.appButton]}
          onPress={() => testTypedNotification(NotificationType.APP_UPDATE)}
        >
          <Text style={styles.buttonText}>App-uppdatering</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  scrollContainer: {
    maxHeight: 200,
  },
  button: {
    backgroundColor: theme.colors.gold,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  orderButton: {
    backgroundColor: '#D4AF37', // Guldfärg
  },
  promoButton: {
    backgroundColor: '#4CAF50', // Grön
  },
  appButton: {
    backgroundColor: '#2196F3', // Blå
  },
  buttonText: {
    color: theme.colors.buttonText || '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 