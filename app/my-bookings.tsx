import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useBookingStore, Booking } from '@/store/booking-store';
import BackButton from '@/components/BackButton';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  MessageSquare, 
  X, 
  Edit2, 
  Trash2,
  ChevronRight,
  AlertCircle
} from 'lucide-react-native';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  onEdit: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return theme.colors.subtext;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bekräftad';
      case 'pending': return 'Väntar på bekräftelse';
      case 'cancelled': return 'Avbruten';
      case 'completed': return 'Genomförd';
      default: return status;
    }
  };

  const canModify = booking.status === 'pending' || booking.status === 'confirmed';
  const isPastDate = new Date(booking.date) < new Date();

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={20} color={theme.colors.gold} />
          <Text style={styles.dateText}>
            {format(new Date(booking.date), 'EEEE d MMMM', { locale: sv })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.colors.subtext} />
          <Text style={styles.detailText}>Tid: {booking.time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Users size={16} color={theme.colors.subtext} />
          <Text style={styles.detailText}>Gäster: {booking.guests}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Phone size={16} color={theme.colors.subtext} />
          <Text style={styles.detailText}>Telefon: {booking.phone}</Text>
        </View>

        {booking.message && (
          <View style={styles.detailRow}>
            <MessageSquare size={16} color={theme.colors.subtext} />
            <Text style={styles.detailText}>Meddelande: {booking.message}</Text>
          </View>
        )}
      </View>

      {canModify && !isPastDate && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(booking)}
          >
            <Edit2 size={16} color="#2196F3" />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Ändra</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(booking.id)}
          >
            <Trash2 size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Avbryt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

interface EditBookingModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onSave: (updates: Partial<Booking>) => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ visible, booking, onClose, onSave }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (booking) {
      setDate(booking.date);
      setTime(booking.time);
      setGuests(booking.guests);
      setPhone(booking.phone);
      setMessage(booking.message || '');
    }
  }, [booking]);

  const handleSave = () => {
    if (!date || !time || !guests || !phone) {
      Alert.alert('Fel', 'Vänligen fyll i alla obligatoriska fält');
      return;
    }

    const updates: Partial<Booking> = {};
    if (date !== booking?.date) updates.date = date;
    if (time !== booking?.time) updates.time = time;
    if (guests !== booking?.guests) updates.guests = guests;
    if (phone !== booking?.phone) updates.phone = phone;
    if (message !== booking?.message) updates.message = message;

    if (Object.keys(updates).length === 0) {
      Alert.alert('Ingen ändring', 'Du har inte gjort några ändringar');
      return;
    }

    onSave(updates);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Ändra bokning</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Datum *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tid *</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Antal gäster *</Text>
            <TextInput
              style={styles.input}
              value={guests}
              onChangeText={setGuests}
              placeholder="2 personer"
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Ditt telefonnummer"
              placeholderTextColor={theme.colors.subtext}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meddelande</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Eventuella önskemål eller meddelande"
              placeholderTextColor={theme.colors.subtext}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Spara ändringar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelModalButton} onPress={onClose}>
              <Text style={styles.cancelModalButtonText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const { bookings, isLoading, fetchUserBookings, cancelBooking, updateBooking } = useBookingStore();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Avbryt bokning',
      'Är du säker på att du vill avbryta denna bokning?',
      [
        { text: 'Nej', style: 'cancel' },
        {
          text: 'Ja, avbryt',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelBooking(bookingId);
            if (result.success) {
              Alert.alert('Bokning avbruten', 'Din bokning har avbrutits. Restaurangen har informerats via push-notis.');
            } else {
              Alert.alert('Fel', 'Kunde inte avbryta bokningen. Försök igen senare.');
            }
          }
        }
      ]
    );
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleSaveBooking = async (updates: Partial<Booking>) => {
    if (!editingBooking) return;

    const result = await updateBooking(editingBooking.id, updates);
    if (result.success) {
      setShowEditModal(false);
      setEditingBooking(null);
      Alert.alert('Bokning uppdaterad', 'Din bokning har ändrats. Restaurangen har informerats via push-notis.');
    } else {
      Alert.alert('Fel', 'Kunde inte uppdatera bokningen. Försök igen senare.');
    }
  };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'completed');

    if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Mina bokningar',
            headerStyle: { backgroundColor: theme.colors.background },
            headerTitleStyle: { color: theme.colors.text },
            headerShadowVisible: false,
          }}
        />
        <View style={styles.headerContainer}>
          <BackButton 
            title="Tillbaka" 
            variant="gold"
            style={styles.backButton}
          />
        </View>
        
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
          <Text style={styles.loadingText}>Laddar dina bokningar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Mina bokningar',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.text },
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.headerContainer}>
        <BackButton 
          title="Tillbaka" 
          variant="gold"
          style={styles.backButton}
        />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={64} color={theme.colors.subtext} />
            <Text style={styles.emptyTitle}>Inga bokningar</Text>
            <Text style={styles.emptyText}>
              Du har inga bordsbokningar ännu. Boka ett bord för att se dina bokningar här.
            </Text>
            <TouchableOpacity 
              style={styles.bookTableButton}
              onPress={() => router.push('/booking')}
            >
              <Text style={styles.bookTableButtonText}>Boka bord</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aktiva bokningar</Text>
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelBooking}
                    onEdit={handleEditBooking}
                  />
                ))}
              </View>
            )}

            {pastBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tidigare bokningar</Text>
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelBooking}
                    onEdit={handleEditBooking}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <EditBookingModal
        visible={showEditModal}
        booking={editingBooking}
        onClose={() => {
          setShowEditModal(false);
          setEditingBooking(null);
        }}
        onSave={handleSaveBooking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  bookTableButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
  },
  bookTableButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  bookingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border || 'rgba(255, 255, 255, 0.1)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || 'rgba(255, 255, 255, 0.1)',
    paddingTop: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  editButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  cancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border || 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    marginTop: theme.spacing.xl,
  },
  saveButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  saveButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelModalButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.subtext,
  },
  cancelModalButtonText: {
    color: theme.colors.subtext,
    fontSize: 16,
    fontWeight: '600',
  },
    headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
}); 