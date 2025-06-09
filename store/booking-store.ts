import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useUserStore } from './user-store';

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  user_id?: string;
  created_at: string;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchUserBookings: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean, error?: any }>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<{ success: boolean, error?: any }>;
  clearBookings: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchUserBookings: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const bookings: Booking[] = bookingsData?.map(booking => ({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
        message: booking.message,
        status: booking.status,
        user_id: booking.user_id,
        created_at: booking.created_at,
      })) || [];

      set({ bookings, isLoading: false });
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ isLoading: true });

    try {
      // Uppdatera status i databasen
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Uppdatera lokal state
      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        ),
        isLoading: false,
      }));

      // Skicka push-notifikation till admins
      try {
        const { PushNotificationService } = await import('@/utils/PushNotificationService');
        const booking = get().bookings.find(b => b.id === bookingId);
        if (booking) {
          await PushNotificationService.notifyAdminsBookingCancelled({
            id: bookingId,
            name: booking.name,
            date: booking.date,
            time: booking.time,
            guests: booking.guests,
          });
        }
      } catch (notificationError) {
        console.error('❌ Fel vid skicka admin-notifikation för avbruten bokning:', notificationError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      set({ error: (error as Error).message, isLoading: false });
      return { success: false, error };
    }
  },

  updateBooking: async (bookingId: string, updates: Partial<Booking>) => {
    set({ isLoading: true });

    try {
      // Uppdatera i databasen
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Uppdatera lokal state
      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        ),
        isLoading: false,
      }));

      // Skicka push-notifikation till admins
      try {
        const { PushNotificationService } = await import('@/utils/PushNotificationService');
        const booking = get().bookings.find(b => b.id === bookingId);
        if (booking) {
          await PushNotificationService.notifyAdminsBookingUpdated({
            id: bookingId,
            name: booking.name,
            date: booking.date,
            time: booking.time,
            guests: booking.guests,
            changes: updates,
          });
        }
      } catch (notificationError) {
        console.error('❌ Fel vid skicka admin-notifikation för ändrad bokning:', notificationError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      set({ error: (error as Error).message, isLoading: false });
      return { success: false, error };
    }
  },

  clearBookings: () => {
    set({ bookings: [], error: null });
  },
})); 