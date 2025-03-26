import React from 'react';
import { Slot, Stack, useRouter, usePathname } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  const { isAdmin, isLoading } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const getScreenTitle = () => {
    if (pathname.includes('/admin/users')) return 'Användare';
    if (pathname.includes('/admin/orders')) return 'Ordrar';
    if (pathname.includes('/admin/settings')) return 'Inställningar';
    return 'Admin';
  };

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={{ marginTop: 20, color: theme.colors.text, fontSize: 16 }}>
          Laddar...
        </Text>
      </View>
    );
  }

  if (!isAdmin) {
    // Användaren är inte admin, visa ett felmeddelande
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20,
        backgroundColor: theme.colors.background 
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: theme.colors.text,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          Åtkomst nekad
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: theme.colors.subtext,
          textAlign: 'center' 
        }}>
          Du har inte behörighet att visa denna sida.
        </Text>
      </View>
    );
  }

  // Användaren är admin, visa admin-sidorna med en egen tillbaka-knapp
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        </View>
        <Slot />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
}); 