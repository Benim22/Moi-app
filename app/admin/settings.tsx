import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Switch,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import BackButton from '@/components/BackButton';
import { Clock, MapPin, Globe, Mail, Phone, Save } from 'lucide-react-native';
import { useRestaurantStore } from '@/store/restaurant-store';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { settings: storeSettings, isLoading: storeLoading, fetchSettings, updateSettings } = useRestaurantStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(storeSettings);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      await fetchSettings();
      setSettings(storeSettings);
      setIsLoading(false);
    } catch (error) {
      console.error('Fel vid hämtning av inställningar:', error);
      Alert.alert('Fel', 'Kunde inte hämta restaurangens inställningar.');
      setIsLoading(false);
    }
  };
  
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      const success = await updateSettings(settings);
      
      setIsSaving(false);
      
      if (success) {
        Alert.alert('Sparat', 'Inställningarna har sparats.');
      } else {
        Alert.alert('Fel', 'Kunde inte spara inställningarna. Försök igen.');
      }
    } catch (error) {
      console.error('Fel vid sparande av inställningar:', error);
      Alert.alert('Fel', 'Kunde inte spara inställningarna.');
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  if (isLoading || storeLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen 
          options={{
            title: 'Inställningar',
            headerStyle: { backgroundColor: theme.colors.card },
            headerTitleStyle: { color: theme.colors.text },
            headerLeft: () => (
              <BackButton 
                title=""
                variant="gold"
                size={26}
                style={styles.headerBackButton}
              />
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
          <Text style={styles.loadingText}>Laddar inställningar...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          title: 'Inställningar',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text },
          headerLeft: () => (
            <BackButton 
              title=""
              variant="gold"
              size={26}
              style={styles.headerBackButton}
            />
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Restauranginställningar</Text>
            <Text style={styles.subtitle}>Hantera information och funktioner för restaurangen</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restauranginformation</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Text style={styles.labelText}>Restaurangnamn</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={settings.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Restaurangnamn"
                placeholderTextColor={theme.colors.text}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Text style={styles.labelText}>Beskrivning</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={settings.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Beskrivning av restaurangen"
                placeholderTextColor={theme.colors.text}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Clock size={20} color={theme.colors.text} />
                <Text style={styles.labelText}>Öppettider</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={settings.open_hours}
                onChangeText={(text) => handleInputChange('open_hours', text)}
                placeholder="Öppettider"
                placeholderTextColor={theme.colors.text}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MapPin size={20} color={theme.colors.text} />
                <Text style={styles.labelText}>Adress</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={settings.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Adress"
                placeholderTextColor={theme.colors.text}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Globe size={20} color={theme.colors.text} />
                <Text style={styles.labelText}>Webbplats</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={settings.website}
                onChangeText={(text) => handleInputChange('website', text)}
                placeholder="Webbplats"
                placeholderTextColor={theme.colors.text}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Mail size={20} color={theme.colors.text} />
                <Text style={styles.labelText}>E-post</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={settings.contact_email}
                onChangeText={(text) => handleInputChange('contact_email', text)}
                placeholder="E-post"
                placeholderTextColor={theme.colors.text}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Phone size={20} color={theme.colors.text} />
                <Text style={styles.labelText}>Telefon</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={settings.contact_phone}
                onChangeText={(text) => handleInputChange('contact_phone', text)}
                placeholder="Telefon"
                placeholderTextColor={theme.colors.text}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leveransinställningar</Text>
            
            <View style={styles.toggleGroup}>
              <Text style={styles.toggleLabel}>Aktivera leverans</Text>
              <Switch
                value={settings.delivery_enabled}
                onValueChange={(value) => handleInputChange('delivery_enabled', value)}
                trackColor={{ false: '#767577', true: theme.colors.gold }}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Minsta ordervärde (kr)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.min_order_value.toString()}
                onChangeText={(text) => handleInputChange('min_order_value', parseInt(text) || 0)}
                placeholder="Minsta ordervärde"
                placeholderTextColor={theme.colors.text}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Leveransavgift (kr)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.delivery_fee.toString()}
                onChangeText={(text) => handleInputChange('delivery_fee', parseInt(text) || 0)}
                placeholder="Leveransavgift"
                placeholderTextColor={theme.colors.text}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Gräns för gratis leverans (kr)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.free_delivery_threshold.toString()}
                onChangeText={(text) => handleInputChange('free_delivery_threshold', parseInt(text) || 0)}
                placeholder="Gräns för gratis leverans"
                placeholderTextColor={theme.colors.text}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#111" />
            ) : (
              <>
                <Save size={20} color="#111" />
                <Text style={styles.saveButtonText}>Spara ändringar</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gold,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerBackButton: {
    backgroundColor: theme.colors.gold,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
}); 