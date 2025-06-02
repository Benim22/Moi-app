import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  Image
} from 'react-native';
import { Stack } from 'expo-router';
import { theme, globalStyles } from '@/constants/theme';
import { Mail, Phone, MapPin, Globe, Send } from 'lucide-react-native';
import { useRestaurantStore } from '@/store/restaurant-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '@/components/Footer';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { settings, fetchSettings, isLoading: settingsLoading } = useRestaurantStore();

  // Plattformsspecifik API_URL för att lösa nätverksproblem
  const API_URL = Platform.select({
    // För Android-emulatorer används 10.0.2.2 för att komma åt host-datorns localhost
    android: 'http://192.168.1.131:3000/api',
    // För iOS-simulatorer och webb fungerar localhost
    // ios: 'http://localhost:3000/api',
    // Om du testar på en fysisk enhet, använd din dators IP-adress
    ios: 'http://192.168.1.131:3000/api',
    default: 'http://192.168.1.131:3000/api'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCall = () => {
    const phoneNumber = settings.contact_phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${settings.contact_email}`);
  };

  const handleMaps = () => {
    const address = settings.address;
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Fel', 'Kunde inte öppna kartor');
      });
    }
  };

  const handleWebsite = () => {
    let websiteUrl = settings.website;
    // Lägg till http:// om det saknas
    if (!/^https?:\/\//i.test(websiteUrl)) {
      websiteUrl = 'https://' + websiteUrl;
    }
    Linking.openURL(websiteUrl);
  };

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Fel', 'Vänligen ange ditt namn.');
      return;
    }
    if (!email) {
      Alert.alert('Fel', 'Vänligen ange din e-postadress.');
      return;
    }
    if (!subject) {
      Alert.alert('Fel', 'Vänligen ange ett ämne.');
      return;
    }
    if (!message) {
      Alert.alert('Fel', 'Vänligen skriv ett meddelande.');
      return;
    }

    // Validera e-post
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Fel', 'Vänligen ange en giltig e-postadress');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending contact request to:', `${API_URL}/email/contact`);
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
          console.log('Server status check OK, proceeding with contact form');
        } else {
          console.warn('Server status check failed:', await statusResponse.text());
        }
      } catch (error) {
        const statusError = error as Error;
        console.warn('Server status check error:', statusError.message);
        // Vi fortsätter ändå med kontaktformuläret
      }

      const response = await fetch(`${API_URL}/email/contact`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
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
        throw new Error(responseData.error || 'Failed to send message');
      }

      Alert.alert(
        'Meddelande skickat', 
        `Tack för ditt meddelande ${name}! Vi kommer att återkomma till dig så snart som möjligt.`,
        [{ text: 'OK' }]
      );

      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mer detaljerad felanalys och användarmeddelande
      let errorMessage = 'Det gick inte att skicka meddelandet.';
      
      const error = err as Error;
      if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'Nätverksfel. Kontrollera din internetanslutning och försök igen.';
      } else if (error.message) {
        errorMessage = `Fel: ${error.message}`;
      }
      
      Alert.alert(
        'Något gick fel',
        `${errorMessage} Du kan också kontakta oss via telefon.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Laddar information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            onError={() => console.error('Kunde inte ladda logotypen')}
          />
          <Text style={styles.headerTitle}>Kontakta Oss</Text>
          <Text style={styles.headerSubtitle}>Vi finns här för att hjälpa dig</Text>
        </View>
        
        <View style={styles.contactInfoContainer}>
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <View style={[styles.iconContainer, { backgroundColor: '#4ECDC4' }]}>
              <Phone size={24} color="#fff" />
            </View>
            <View style={styles.contactItemContent}>
              <Text style={styles.contactItemTitle}>Ring oss</Text>
              <Text style={styles.contactItemText}>{settings.contact_phone}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
              <Mail size={24} color="#fff" />
            </View>
            <View style={styles.contactItemContent}>
              <Text style={styles.contactItemTitle}>E-post</Text>
              <Text style={styles.contactItemText}>{settings.contact_email}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleMaps}>
            <View style={[styles.iconContainer, { backgroundColor: '#F9D56E' }]}>
              <MapPin size={24} color="#111" />
            </View>
            <View style={styles.contactItemContent}>
              <Text style={styles.contactItemTitle}>Besök oss</Text>
              <Text style={styles.contactItemText}>{settings.address}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
            <View style={[styles.iconContainer, { backgroundColor: '#9D8DF1' }]}>
              <Globe size={24} color="#fff" />
            </View>
            <View style={styles.contactItemContent}>
              <Text style={styles.contactItemTitle}>Vår webbplats</Text>
              <Text style={styles.contactItemText}>{settings.website}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Skicka ett meddelande</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Namn</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ditt namn"
              placeholderTextColor={theme.colors.subtext}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-post</Text>
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
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ämne</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Ämne för ditt meddelande"
              placeholderTextColor={theme.colors.subtext}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Meddelande</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Skriv ditt meddelande här..."
              placeholderTextColor={theme.colors.subtext}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#111" />
            ) : (
              <>
                <Send size={20} color="#111" style={styles.sendIcon} />
                <Text style={styles.sendButtonText}>Skicka meddelande</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.openHoursContainer}>
          <Text style={styles.openHoursTitle}>Öppettider</Text>
          <View style={styles.openHoursContent}>
            <Text style={styles.openHoursText}>Mån-Fre: 11.00 - 21.00</Text>
            <Text style={styles.openHoursText}>Lördag: 12.00 - 21.00</Text>
            <Text style={styles.openHoursText}>Söndag: 15.00 - 21.00</Text>
          </View>
        </View>
        
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
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
  contactInfoContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactItemContent: {
    flex: 1,
  },
  contactItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactItemText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  formContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 120,
  },
  sendButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  openHoursContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openHoursTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  openHoursContent: {
    flexDirection: 'column',
  },
  openHoursText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
});