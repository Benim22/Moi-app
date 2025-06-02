import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, globalStyles } from '@/constants/theme';
import { Calendar, User, Mail, Phone, MessageSquare, Users, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useUserStore } from '@/store/user-store';
import { format, addDays, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Stack } from 'expo-router';
import Footer from '@/components/Footer';

// Interface för datum och tid objekt
interface TimeOption {
  id: string;
  value: string;
  label: string;
}

interface TimePickerProps {
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  visible: boolean;
  onClose: () => void;
}

const TimePickerView: React.FC<TimePickerProps> = ({ selectedTime, onSelectTime, visible, onClose }) => {
  const timeSlots = [
    { period: 'Lunch', times: ['11:30', '12:00', '12:30', '13:00', '13:30'] },
    { period: 'Middag', times: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] }
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Välj tid</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Stäng</Text>
            </TouchableOpacity>
          </View>
          
          {timeSlots.map((slot, index) => (
            <View key={slot.period} style={styles.timePeriodContainer}>
              <Text style={styles.periodTitle}>{slot.period}</Text>
              <View style={styles.timeButtonsContainer}>
                {slot.times.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      selectedTime === time && styles.selectedTimeButton
                    ]}
                    onPress={() => {
                      onSelectTime(time);
                      onClose();
                    }}
                  >
                    <Text style={[
                      styles.timeButtonText,
                      selectedTime === time && styles.selectedTimeButtonText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const CalendarView = ({ selectedDate, onSelectDate, visible, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const weeks = ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'];
  
  const getDaysInMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };
  
  const days = getDaysInMonth(currentMonth);
  const firstDayOfMonth = startOfMonth(currentMonth);
  const emptyDays = firstDayOfMonth.getDay();
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <ChevronLeft size={24} color={theme.colors.gold} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {format(currentMonth, 'MMMM yyyy', { locale: sv })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight size={24} color={theme.colors.gold} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekDaysContainer}>
            {weeks.map((week, index) => (
              <Text key={index} style={styles.weekDay}>{week}</Text>
            ))}
          </View>
          
          <View style={styles.daysContainer}>
            {[...Array(emptyDays)].map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}
            
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <TouchableOpacity
                  key={day.toString()}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isToday && styles.today
                  ]}
                  onPress={() => {
                    onSelectDate(day);
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText
                  ]}>
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function BookingScreen() {
  const { profile } = useUserStore();
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2 personer');
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeDropdownVisible, setTimeDropdownVisible] = useState(false);

  // Uppdaterad API_URL med plattformsspecifik hantering för att lösa nätverksproblem
  const API_URL = Platform.select({
    // För Android-emulatorer används 10.0.2.2 för att komma åt host-datorns localhost
    android: 'http://192.168.1.131:3000/api',
    // För iOS-simulatorer och webb fungerar localhost
    ios: 'http://192.168.1.131:3000/api',
    // Om du testar på en fysisk enhet, använd din dators IP-adress
    default: 'http://192.168.1.131:3000/api'
  });

  // Generera en lista med tillgängliga datum för närmaste 14 dagarna (ändrat från 30)
  const availableDates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    availableDates.push({
      id: i.toString(),
      value: format(date, 'yyyy-MM-dd', { locale: sv }),
      label: format(date, 'EEEE d MMMM', { locale: sv })
    });
  }

  // Lista med vanliga bokningstider
  const availableTimes = [
    { id: '1', value: '11:30', label: '11:30' },
    { id: '2', value: '12:00', label: '12:00' },
    { id: '3', value: '12:30', label: '12:30' },
    { id: '4', value: '13:00', label: '13:00' },
    { id: '5', value: '13:30', label: '13:30' },
    { id: '6', value: '17:00', label: '17:00' },
    { id: '7', value: '17:30', label: '17:30' },
    { id: '8', value: '18:00', label: '18:00' },
    { id: '9', value: '18:30', label: '18:30' },
    { id: '10', value: '19:00', label: '19:00' },
    { id: '11', value: '19:30', label: '19:30' },
    { id: '12', value: '20:00', label: '20:00' },
    { id: '13', value: '20:30', label: '20:30' },
    { id: '14', value: '21:00', label: '21:00' },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDate(format(date, 'yyyy-MM-dd'));
    setShowCalendar(false);
  };

  const handleTimeSelect = (time: string) => {
    setTime(time);
    setTimeDropdownVisible(false);
  };

  const guestOptions = [
    '1 person',
    '2 personer',
    '3 personer',
    '4 personer',
    '5 personer',
    '6 personer',
    'Fler än 6 personer',
  ];

  const handleSubmit = async () => {
    if (!date || !time || !name || !email || !phone) {
      Alert.alert('Fel', 'Vänligen fyll i alla obligatoriska fält');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Fel', 'Vänligen ange en giltig e-postadress');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending booking request to:', `${API_URL}/email/booking`);
      console.log('Using platform:', Platform.OS);
      
      // Testa först om servern är tillgänglig
      try {
        const statusResponse = await fetch(`${API_URL}/status`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (statusResponse.ok) {
          console.log('Server status check OK, proceeding with booking');
        } else {
          console.warn('Server status check failed:', await statusResponse.text());
        }
      } catch (error) {
        const statusError = error as Error;
        console.warn('Server status check error:', statusError.message);
        // Vi fortsätter ändå med bokningen, för att se om det fungerar
      }
      
      // Nu skickar vi bokningsförfrågan
      const response = await fetch(`${API_URL}/email/booking`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: email,
          customerName: name,
          bookingDate: date,
          bookingTime: time,
          guests,
          phone,
          message,
        }),
      });

      // Försök att få svarsdata, men hantera även om svaret inte är giltigt JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { error: 'Could not parse server response' };
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send booking');
      }

      Alert.alert(
        'Bokning mottagen', 
        `Tack för din bokning ${name}! Vi har skickat en bekräftelse till ${email}. Vi ser fram emot att välkomna dig ${date} kl ${time}.`,
        [{ text: 'OK' }]
      );
      
      // Reset form
      setDate('');
      setSelectedDate(null);
      setTime('');
      setGuests('2 personer');
      setMessage('');
    } catch (err) {
      console.error('Error sending booking:', err);
      
      // Mer detaljerad felanalys och användarmeddelande
      let errorMessage = 'Det gick inte att skicka bokningen.';
      
      const error = err as Error;
      if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'Nätverksfel. Kontrollera din internetanslutning och försök igen.';
      } else if (error.message) {
        errorMessage = `Fel: ${error.message}`;
      }
      
      Alert.alert(
        'Något gick fel',
        `${errorMessage} Du kan också kontakta oss via telefon för att boka bord.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true
        }}
      />
      
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            onError={() => console.error('Kunde inte ladda logotypen')}
          />
          <Text style={styles.headerTitle}>Boka Bord</Text>
          <Text style={styles.headerSubtitle}>Välj datum och tid för din bokning</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Datum *</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowCalendar(true)}
            >
              <Calendar size={20} color={theme.colors.subtext} />
              <Text style={[styles.input, !date && styles.placeholder, {flex: 1}]}>
                {date ? format(new Date(date), 'EEEE d MMMM', { locale: sv }) : 'Välj datum'}
              </Text>
              <ChevronDown size={18} color={theme.colors.subtext} />
            </TouchableOpacity>

            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              visible={showCalendar}
              onClose={() => setShowCalendar(false)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tid *</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setTimeDropdownVisible(true)}
            >
              <Clock size={20} color={theme.colors.subtext} />
              <Text style={[styles.input, !time && styles.placeholder, {flex: 1}]}>
                {time || 'Välj tid'}
              </Text>
              <ChevronDown size={18} color={theme.colors.subtext} />
            </TouchableOpacity>
            
            <TimePickerView
              selectedTime={time}
              onSelectTime={handleTimeSelect}
              visible={timeDropdownVisible}
              onClose={() => setTimeDropdownVisible(false)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Antal gäster *</Text>
            <View style={styles.guestsContainer}>
              {guestOptions.map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[
                    styles.guestOption,
                    guests === option && styles.selectedGuestOption
                  ]}
                  onPress={() => setGuests(option)}
                >
                  <Text style={[
                    styles.guestOptionText,
                    guests === option && styles.selectedGuestOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Namn *</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color={theme.colors.subtext} />
              <TextInput 
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ditt namn"
                placeholderTextColor={theme.colors.subtext}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-post *</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={theme.colors.subtext} />
              <TextInput 
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Din e-post"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon *</Text>
            <View style={styles.inputWrapper}>
              <Phone size={20} color={theme.colors.subtext} />
              <TextInput 
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ditt telefonnummer"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meddelande</Text>
            <View style={[styles.inputWrapper, styles.messageInput]}>
              <MessageSquare size={20} color={theme.colors.subtext} style={styles.messageIcon} />
              <TextInput 
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Eventuella önskemål eller meddelande"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#111" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Skicka bokning</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: theme.colors.text,
    fontSize: 16,
  },
  placeholder: {
    color: theme.colors.subtext,
  },
  guestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  guestOption: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedGuestOption: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  guestOptionText: {
    color: theme.colors.text,
  },
  selectedGuestOptionText: {
    color: '#111',
    fontWeight: '600',
  },
  messageInput: {
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginTop: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: theme.colors.gold,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
  },
  dropdownItem: {
    padding: 10,
  },
  selectedDropdownItem: {
    backgroundColor: theme.colors.gold,
  },
  dropdownItemText: {
    color: theme.colors.text,
  },
  selectedDropdownItemText: {
    color: '#111',
    fontWeight: '600',
  },
  dropdownList: {
    flexGrow: 1,
  },
  calendarContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gold,
    textTransform: 'capitalize',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.subtext,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedDay: {
    backgroundColor: theme.colors.gold,
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#111',
    fontWeight: '600',
  },
  today: {
    borderWidth: 1,
    borderColor: theme.colors.gold,
    borderRadius: 20,
  },
  todayText: {
    color: theme.colors.gold,
  },
  timePickerContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gold,
  },
  timePeriodContainer: {
    marginBottom: 20,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectedTimeButton: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  timeButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedTimeButtonText: {
    color: '#111',
    fontWeight: '600',
  },
});