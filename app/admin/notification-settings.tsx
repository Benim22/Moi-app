import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import BackButton from '@/components/BackButton';
import { Bell, BellOff, ShoppingBag, Calendar, Save } from 'lucide-react-native';
import { useUserStore } from '@/store/user-store';
import { 
  getAdminNotificationSettings, 
  updateAdminNotificationSetting,
  NotificationType 
} from '@/lib/notifications';

type NotificationSettingItem = {
  type: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
};

export default function AdminNotificationSettingsScreen() {
  const router = useRouter();
  const { user, profile } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingItem[]>([]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadNotificationSettings();
    } else {
      Alert.alert('Fel', 'Du har inte behörighet att se denna sida.');
      router.back();
    }
  }, [profile]);

  const loadNotificationSettings = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const savedSettings = await getAdminNotificationSettings();
      
      const notificationSettings: NotificationSettingItem[] = [
        {
          type: NotificationType.ADMIN_NEW_ORDER,
          title: 'Nya beställningar',
          description: 'Få notifikationer när kunder lägger nya beställningar',
          icon: ShoppingBag,
          enabled: savedSettings[NotificationType.ADMIN_NEW_ORDER] ?? true,
        },
        {
          type: NotificationType.ADMIN_NEW_BOOKING,
          title: 'Nya bordsbokningar',
          description: 'Få notifikationer när kunder bokar bord',
          icon: Calendar,
          enabled: savedSettings[NotificationType.ADMIN_NEW_BOOKING] ?? true,
        },
      ];
      
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Fel vid hämtning av notifikationsinställningar:', error);
      Alert.alert('Fel', 'Kunde inte hämta notifikationsinställningar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = (index: number, value: boolean) => {
    setSettings(prev => 
      prev.map((setting, i) => 
        i === index ? { ...setting, enabled: value } : setting
      )
    );
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      
      const promises = settings.map(setting =>
        updateAdminNotificationSetting(setting.type, setting.enabled)
      );
      
      const results = await Promise.all(promises);
      const allSuccessful = results.every((result: boolean) => result);
      
      if (allSuccessful) {
        Alert.alert('Sparat', 'Notifikationsinställningarna har sparats.');
      } else {
        Alert.alert('Fel', 'Några inställningar kunde inte sparas. Försök igen.');
      }
    } catch (error) {
      console.error('Fel vid sparande av notifikationsinställningar:', error);
      Alert.alert('Fel', 'Kunde inte spara inställningarna.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen 
          options={{
            title: 'Notifikationsinställningar',
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
          title: 'Notifikationsinställningar',
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
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Bell size={32} color={theme.colors.gold} />
          <Text style={styles.title}>Notifikationsinställningar</Text>
          <Text style={styles.subtitle}>
            Ställ in vilka notifikationer du vill få som administratör
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin-notifikationer</Text>
          <Text style={styles.sectionDescription}>
            Dessa notifikationer hjälper dig att hålla koll på nya aktiviteter i restaurangen.
          </Text>
          
          {settings.map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <View key={setting.type} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingHeader}>
                    <IconComponent size={20} color={theme.colors.text} />
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                  </View>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={(value) => handleToggleSetting(index, value)}
                  trackColor={{ false: '#767577', true: theme.colors.gold }}
                  thumbColor="#f4f3f4"
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Viktigt att veta:</Text>
            <Text style={styles.infoText}>
              • Notifikationer skickas endast när du har en aktiv push-token registrerad
            </Text>
            <Text style={styles.infoText}>
              • Du kan när som helst ändra dessa inställningar
            </Text>
            <Text style={styles.infoText}>
              • Notifikationer kommer att visas även när appen är stängd
            </Text>
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
              <Text style={styles.saveButtonText}>Spara inställningar</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 20,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 18,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.gold,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
  },
}); 