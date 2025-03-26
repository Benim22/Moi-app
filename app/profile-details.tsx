import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/user-store';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const { profile, updateProfile, isLoading } = useUserStore();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setUserData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (data) {
          // Uppdatera profilen manuellt för att undvika refreshProfile
          useUserStore.setState({ 
            profile: data,
            isAdmin: data.role === 'admin' 
          });
        }
      }
    };
    
    checkAuth();
  }, []);
  
  const handleChange = (field: string, value: string) => {
    setUserData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Förbättrad kontroll av ändringar - mer exakt jämförelse
      const hasChanged = 
        newData.name !== (profile?.name || '') ||
        newData.phone !== (profile?.phone || '') ||
        newData.address !== (profile?.address || '');
      
      console.log('Ändringar upptäckta:', hasChanged, {
        newName: newData.name,
        profileName: profile?.name || '',
        newPhone: newData.phone,
        profilePhone: profile?.phone || '',
        newAddress: newData.address,
        profileAddress: profile?.address || ''
      });
      
      setHasChanges(hasChanged);
      return newData;
    });
  };
  
  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('Ingen ändring', 'Det finns inga ändringar att spara.');
      return;
    }
    
    try {
      console.log('Sparar profil med data:', {
        name: userData.name,
        phone: userData.phone,
        address: userData.address
      });
      
      const { error } = await updateProfile({
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
      });
      
      if (error) {
        console.error('Fel vid sparande av profil:', error);
        Alert.alert('Fel', 'Det gick inte att spara din profilinformation. Försök igen senare.');
        return;
      }
      
      Alert.alert('Uppdaterad', 'Din profilinformation har sparats.', [
        { text: 'OK', onPress: () => setHasChanges(false) }
      ]);
    } catch (error) {
      console.error('Fel:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade. Försök igen senare.');
    }
  };
  
  // Funktion som returnerar användarens första bokstav för profilbilden
  const getInitialLetter = () => {
    if (userData.name && userData.name.length > 0) {
      return userData.name.charAt(0).toUpperCase();
    }
    return 'A';
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Min profil',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.text },
          headerShadowVisible: false,
          headerLeft: () => (
            <BackButton 
              title=""
              variant="gold"
              size={26}
              style={styles.headerBackButton}
            />
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              style={[
                styles.saveButton, 
                !hasChanges && styles.saveButtonDisabled
              ]}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.background} />
              ) : (
                <>
                  <Save size={20} color={hasChanges ? theme.colors.background : theme.colors.subtext} />
                  <Text style={[
                    styles.saveButtonText, 
                    !hasChanges && styles.saveButtonTextDisabled
                  ]}>
                    Spara
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profilbild med användarens första bokstav */}
          <View style={styles.profileImageSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.initialLetter}>{getInitialLetter()}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Profilinformation</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color={theme.colors.gold} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ditt namn"
                  placeholderTextColor={theme.colors.subtext}
                  value={userData.name}
                  onChangeText={(text) => handleChange('name', text)}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={theme.colors.gold} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  placeholder="E-postadress"
                  placeholderTextColor={theme.colors.subtext}
                  value={userData.email}
                  editable={false}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={theme.colors.gold} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Telefonnummer"
                  placeholderTextColor={theme.colors.subtext}
                  value={userData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={theme.colors.gold} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Leveransadress"
                  placeholderTextColor={theme.colors.subtext}
                  value={userData.address}
                  onChangeText={(text) => handleChange('address', text)}
                  multiline
                />
              </View>
            </View>
          </View>
          
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
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
  saveButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  saveButtonTextDisabled: {
    color: theme.colors.subtext,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialLetter: {
    fontSize: 50,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  formContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 40,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: theme.colors.border,
  },
  saveButtonLarge: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonLargeText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});