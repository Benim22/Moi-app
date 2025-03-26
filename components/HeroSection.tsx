import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onButtonPress?: () => void;
  onSecondaryButtonPress?: () => void;
  imageUrl: string;
}

export default function HeroSection({
  title,
  subtitle,
  buttonText,
  secondaryButtonText,
  onButtonPress,
  onSecondaryButtonPress,
  imageUrl,
}: HeroSectionProps) {
  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.buttonContainer}>
              {buttonText && (
                <Pressable style={styles.primaryButton} onPress={onButtonPress}>
                  <Text style={styles.primaryButtonText}>{buttonText}</Text>
                </Pressable>
              )}
              {secondaryButtonText && (
                <Pressable style={styles.secondaryButton} onPress={onSecondaryButtonPress}>
                  <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: '100%',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});