import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { theme } from '@/constants/theme';

export default function Footer() {
  const handleLucelliPress = () => {
    Linking.openURL('https://lucelli.se');
  };

  return (
    <View style={styles.developerSection}>
      <Pressable onPress={handleLucelliPress}>
        <Text style={[styles.developerText, styles.linkText]}>
          Utvecklad av Lucelli
        </Text>
      </Pressable>
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightSubtext}>
          © 2025 Moi Sushi & Poké Bowl
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  developerSection: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.lg,
  },
  developerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  copyrightContainer: {
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginBottom: 2,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: theme.colors.subtext,
    opacity: 0.7,
  },
}); 