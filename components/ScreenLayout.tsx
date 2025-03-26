import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import BackButton from '@/components/BackButton';

type ScreenLayoutProps = {
  children: React.ReactNode;
  title: string;
  headerRight?: React.ReactNode;
  showBackButton?: boolean;
  backButtonVariant?: 'default' | 'header' | 'outline' | 'text' | 'gold';
};

export default function ScreenLayout({ 
  children, 
  title, 
  headerRight,
  showBackButton = true,
  backButtonVariant = 'default',
}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: title,
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text },
          headerLeft: showBackButton ? () => (
            <BackButton 
              title=""
              variant={backButtonVariant}
              color={theme.colors.text}
              size={26}
              style={styles.headerBackButton}
            />
          ) : undefined,
          headerRight: headerRight ? () => headerRight : undefined,
        }}
      />
      
      <View style={styles.content}>
        {children}
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
  },
  headerBackButton: {
    marginLeft: 8,
  },
}); 