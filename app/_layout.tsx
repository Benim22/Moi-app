import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import BackButton from '@/components/BackButton';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  // Initialize auth listener
  useAuth();

  const commonHeaderOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTitleStyle: { color: theme.colors.text }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerLeft: () => (
            <BackButton 
              title=""
              variant="default"
              size={26}
              style={{
                marginLeft: 8,
              }}
            />
          ),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ 
          ...commonHeaderOptions, 
          presentation: 'modal', 
          title: 'Logga in' 
        }} />
        <Stack.Screen name="cart" options={{ 
          ...commonHeaderOptions, 
          title: 'Kundkorg' 
        }} />
        <Stack.Screen name="checkout" options={{ 
          ...commonHeaderOptions,
          title: 'Kassa'
        }} />
        <Stack.Screen name="order-history" options={{ 
          ...commonHeaderOptions,
          title: 'Orderhistorik'
        }} />
        <Stack.Screen name="settings" options={{ 
          ...commonHeaderOptions,
          title: 'Inställningar' 
        }} />
        <Stack.Screen name="admin" options={{ 
          ...commonHeaderOptions,
          title: 'Admin' 
        }} />
        <Stack.Screen name="favorites" options={{ 
          ...commonHeaderOptions,
          title: 'Favoriter' 
        }} />
        <Stack.Screen name="profile-details" options={{ 
          ...commonHeaderOptions,
          title: 'Min profil' 
        }} />
      </Stack>
    </SafeAreaProvider>
  );
}