import { supabase } from '@/lib/supabase';
import { NotificationManager } from './NotificationManager';
import { Platform } from 'react-native';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export class PushNotificationService {
  
  /**
   * Skicka push-notis till alla admins
   */
  static async notifyAdmins(payload: PushNotificationPayload): Promise<void> {
    try {
      // Skippa push-notifikationer på web på grund av CORS-problem
      if (Platform.OS === 'web') {
        console.log('ℹ️ Push-notifikationer stöds inte på webben (CORS-begränsning)');
        console.log('🔔 [WEB SIMULATION] Skulle skicka notis till admins:', payload.title);
        return;
      }

      console.log('🔔 Skickar notis till admins:', payload.title);
      
      // Hämta alla admins med push tokens
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('push_token, name, email')
        .eq('role', 'admin')
        .not('push_token', 'is', null);

      if (error) {
        console.error('❌ Fel vid hämtning av admins:', error);
        return;
      }

      if (!admins || admins.length === 0) {
        console.log('ℹ️ Inga admins med push tokens hittades');
        return;
      }

      // Skicka notifikation till varje admin
      const promises = admins.map(async (admin) => {
        if (admin.push_token) {
          try {
            await NotificationManager.sendPushNotificationToToken(admin.push_token, payload);
            console.log(`✅ Notis skickad till admin: ${admin.name || admin.email}`);
          } catch (error) {
            console.error(`❌ Fel vid skicka till ${admin.name}:`, error);
          }
        }
      });

      await Promise.all(promises);
      console.log(`✅ Notis skickad till ${admins.length} admins`);
      
    } catch (error) {
      console.error('❌ Fel vid notifiering av admins:', error);
    }
  }

  /**
   * Skicka push-notis till specifik användare
   */
  static async notifyUser(userId: string, payload: PushNotificationPayload): Promise<void> {
    try {
      // Skippa push-notifikationer på web på grund av CORS-problem
      if (Platform.OS === 'web') {
        console.log('ℹ️ Push-notifikationer stöds inte på webben (CORS-begränsning)');
        console.log(`🔔 [WEB SIMULATION] Skulle skicka notis till användare ${userId}:`, payload.title);
        return;
      }

      console.log(`🔔 Skickar notis till användare ${userId}:`, payload.title);
      
      // Hämta användarens push token
      const { data: user, error } = await supabase
        .from('profiles')
        .select('push_token, name, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Fel vid hämtning av användare:', error);
        return;
      }

      if (!user?.push_token) {
        console.log('ℹ️ Användaren har ingen push token');
        return;
      }

      // Skicka notifikation
      await NotificationManager.sendPushNotificationToToken(user.push_token, payload);
      console.log(`✅ Notis skickad till: ${user.name || user.email}`);
      
    } catch (error) {
      console.error('❌ Fel vid notifiering av användare:', error);
    }
  }

  /**
   * Notifiera admins om ny bordbokning
   */
  static async notifyAdminsNewBooking(booking: {
    name: string;
    date: string;
    time: string;
    guests: string;
    email: string;
    phone: string;
  }): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '🍽️ Ny bordbokning',
      body: `${booking.name} har bokat bord för ${booking.guests} personer den ${booking.date} kl ${booking.time}`,
      data: {
        type: 'booking',
        booking_id: booking.email, // Använd email som identifierare för nu
        action: 'new_booking'
      },
      sound: true,
      priority: 'high'
    };

    await this.notifyAdmins(payload);
  }

  /**
   * Notifiera admins om ny beställning
   */
  static async notifyAdminsNewOrder(order: {
    id: string;
    name: string;
    total_price: number;
    items: any[];
  }): Promise<void> {
    const itemCount = order.items?.length || 0;
    
    const payload: PushNotificationPayload = {
      title: '🛒 Ny beställning',
      body: `${order.name} har lagt en order på ${order.total_price} kr (${itemCount} produkter)`,
      data: {
        type: 'order',
        order_id: order.id,
        action: 'new_order'
      },
      sound: true,
      priority: 'high'
    };

    await this.notifyAdmins(payload);
  }

  /**
   * Notifiera användare att order är slutförd
   */
  static async notifyUserOrderCompleted(userId: string, orderId: string, customerName: string): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '✅ Din beställning är klar!',
      body: 'Din mat är färdig och väntar på att hämtas eller levereras.',
      data: {
        type: 'order_status',
        order_id: orderId,
        action: 'completed'
      },
      sound: true,
      priority: 'high'
    };

    await this.notifyUser(userId, payload);
  }

  /**
   * Notifiera användare att order är avbruten
   */
  static async notifyUserOrderCancelled(userId: string, orderId: string, customerName: string): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '❌ Beställning avbruten',
      body: 'Din beställning har tyvärr avbrutits. Kontakta restaurangen för mer information.',
      data: {
        type: 'order_status',
        order_id: orderId,
        action: 'cancelled'
      },
      sound: true,
      priority: 'normal'
    };

    await this.notifyUser(userId, payload);
  }

  /**
   * Notifiera admins om avbruten bokning
   */
  static async notifyAdminsBookingCancelled(booking: {
    id: string;
    name: string;
    date: string;
    time: string;
    guests: string;
  }): Promise<void> {
    const payload: PushNotificationPayload = {
      title: '🚫 Bokning avbruten',
      body: `${booking.name} har avbrutit sin bokning för ${booking.guests} personer den ${booking.date} kl ${booking.time}`,
      data: {
        type: 'booking',
        booking_id: booking.id,
        action: 'cancelled_booking'
      },
      sound: true,
      priority: 'high'
    };

    await this.notifyAdmins(payload);
  }

  /**
   * Notifiera admins om ändrad bokning
   */
  static async notifyAdminsBookingUpdated(booking: {
    id: string;
    name: string;
    date: string;
    time: string;
    guests: string;
    changes: any;
  }): Promise<void> {
    const changedFields = Object.keys(booking.changes).join(', ');
    
    const payload: PushNotificationPayload = {
      title: '✏️ Bokning ändrad',
      body: `${booking.name} har ändrat sin bokning för ${booking.date} kl ${booking.time}. Ändrade fält: ${changedFields}`,
      data: {
        type: 'booking',
        booking_id: booking.id,
        action: 'updated_booking',
        changes: booking.changes
      },
      sound: true,
      priority: 'high'
    };

    await this.notifyAdmins(payload);
  }
} 