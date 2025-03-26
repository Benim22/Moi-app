import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import UserMenu from '@/components/UserMenu';
import { Stack } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import Footer from '@/components/Footer';

export default function ProfileScreen() {
  const { profile } = useUserStore();
  
  // Funktion som returnerar användarens första bokstav för profilbilden
  const getInitialLetter = () => {
    if (profile?.name && profile.name.length > 0) {
      return profile.name.charAt(0).toUpperCase();
    }
    return 'A';
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true
        }}
      />
      <View style={styles.content}>
        <UserMenu />
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
});