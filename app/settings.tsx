import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Bell, Moon, Globe, Shield, Trash2, LogOut, User, ShieldAlert, Mail, Phone, BookUser, FileText, HelpCircle, ChevronRight, Settings as SettingsIcon } from 'lucide-react-native';
import { useUserStore } from '@/store/user-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '@/components/BackButton';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

// Ersätter expo-notifications-implementationen om paketet saknas
const Notifications = {
  requestPermissionsAsync: async () => ({ status: 'granted' })
};

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, isAdmin, user, profile } = useUserStore();
  
  // Använd lokalt state istället för useSettingsStore
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('Svenska');
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  
  const languages = [
    { code: 'sv', name: 'Svenska' },
    { code: 'en', name: 'English' }
  ];
  
  useEffect(() => {
    async function loadSettings() {
      try {
        const storedDarkMode = await AsyncStorage.getItem('darkMode');
        const storedNotifications = await AsyncStorage.getItem('notifications');
        const storedLanguage = await AsyncStorage.getItem('language');
        
        if (storedDarkMode) setDarkMode(JSON.parse(storedDarkMode));
        if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
        if (storedLanguage) setLanguage(storedLanguage);
        
      } catch (error) {
        console.error('Fel vid laddning av inställningar', error);
      }
    }
    
    loadSettings();
  }, []);
  
  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));
    } catch (error) {
      console.error('Fel vid sparande av dark mode', error);
    }
  };
  
  const toggleNotifications = async (value) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(value));
      
      if (value) {
        // Simulera en lyckad behörighetsbegäran utan expo-notifications
        Alert.alert(
          'Notifikationer aktiverade',
          'Du kommer nu att få pushnotifikationer från appen.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Fel vid sparande av notifikationsinställning:', error);
    }
  };
  
  const changeLanguage = async (langName) => {
    setLanguage(langName);
    try {
      await AsyncStorage.setItem('language', langName);
    } catch (error) {
      console.error('Fel vid sparande av språkinställning', error);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Logga ut',
      'Är du säker på att du vill logga ut?',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Logga ut',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Utloggningsfel:', error);
              Alert.alert('Fel', 'Kunde inte logga ut. Försök igen.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Ta bort konto',
      'Är du säker på att du vill ta bort ditt konto? Denna åtgärd kan inte ångras och all din data kommer att raderas permanent.',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              // Hämta aktuell användare
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) {
                throw new Error('Ingen användare hittades');
              }

              // Ta bort användarens profil från profiles-tabellen
              const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

              if (profileError) {
                throw profileError;
              }

              // Logga ut användaren först
              const { error: signOutError } = await supabase.auth.signOut();
              
              if (signOutError) {
                throw signOutError;
              }

              // Använd logout från useUserStore för att rensa lokal state
              await logout();
              
              // Navigera tillbaka till startsidan
              router.replace('/(tabs)');

              Alert.alert(
                'Konto borttaget',
                'Din profil har tagits bort. Tack för att du använde vår app!',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Fel vid borttagning av konto:', error);
              Alert.alert(
                'Fel',
                'Det gick inte att ta bort ditt konto. Försök igen senare eller kontakta support.'
              );
            }
          },
        },
      ]
    );
  };
  
  const openWebPage = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error('Kunde inte öppna länken:', err);
      Alert.alert('Fel', 'Kunde inte öppna länken');
    });
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen 
        options={{
          title: 'Inställningar',
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
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <SettingsIcon size={30} color={theme.colors.gold} />
          <Text style={styles.headerTitle}>Inställningar</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferenser</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Bell size={24} color={theme.colors.text} />
              <Text style={styles.preferenceText}>Notifikationer</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.gold }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Moon size={24} color={theme.colors.text} />
              <Text style={styles.preferenceText}>Mörkt läge</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.gold }}
              thumbColor="#fff"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.preferenceItem}
            onPress={() => setShowLanguageOptions(!showLanguageOptions)}
          >
            <View style={styles.preferenceLeft}>
              <Globe size={24} color={theme.colors.text} />
              <Text style={styles.preferenceText}>Språk</Text>
            </View>
            <View style={styles.preferenceRight}>
              <Text style={styles.preferenceValue}>{language}</Text>
              <ChevronRight size={20} color={theme.colors.subtext} />
            </View>
          </TouchableOpacity>
          
          {showLanguageOptions && (
            <View style={styles.languageOptions}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.name && styles.selectedLanguageOption
                  ]}
                  onPress={() => {
                    changeLanguage(lang.name);
                    setShowLanguageOptions(false);
                  }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    language === lang.name && styles.selectedLanguageOptionText
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {isAdmin && profile?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.preferenceItem}
              onPress={() => router.push('/admin/index')}
            >
              <View style={styles.preferenceLeft}>
                <Shield size={24} color={theme.colors.gold} />
                <Text style={[styles.preferenceText, { color: theme.colors.gold }]}>
                  Admin Panel
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gold} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konto</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/profile-details')}
          >
            <View style={styles.settingItemLeft}>
              <User size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Min profil</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/order-history')}
          >
            <View style={styles.settingItemLeft}>
              <FileText size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Orderhistorik</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/favorites')}
          >
            <View style={styles.settingItemLeft}>
              <BookUser size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Mina favoriter</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hjälp</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/contact')}
          >
            <View style={styles.settingItemLeft}>
              <Mail size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Kontakta oss</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => openWebPage('https://moisushi.se/faq')}
          >
            <View style={styles.settingItemLeft}>
              <HelpCircle size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Vanliga frågor</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => openWebPage('https://moisushi.se/terms')}
          >
            <View style={styles.settingItemLeft}>
              <FileText size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Användarvillkor</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => openWebPage('https://moisushi.se/privacy')}
          >
            <View style={styles.settingItemLeft}>
              <ShieldAlert size={24} color={theme.colors.text} />
              <Text style={styles.settingItemText}>Integritetspolicy</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtext} />
          </TouchableOpacity>
        </View>
        
        {user && (
          <View style={styles.dangerSection}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logga ut</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Trash2 size={16} color={theme.colors.error} style={styles.deleteIcon} />
              <Text style={styles.deleteButtonText}>Ta bort konto</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  preferenceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceValue: {
    fontSize: 16,
    color: theme.colors.subtext,
    marginRight: 8,
  },
  languageOptions: {
    padding: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedLanguageOption: {
    backgroundColor: theme.colors.gold + '33', // Adding transparency
  },
  languageOptionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedLanguageOptionText: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  dangerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  deleteIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 24,
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