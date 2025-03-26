import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HistorySection() {
  const router = useRouter();

  const navigateToAbout = () => {
    router.push('/about');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vår Historia</Text>
      <Text style={styles.description}>
        Moi Sushi & Poké Bowl startade som en liten sushirestaurang i Trelleborg och har utvecklats 
        till en älskad kulinarisk destination. Vi är stolta över att servera färska, djärva smaker och ge en 
        utmärkt service till våra gäster.
      </Text>
      <Pressable style={styles.button} onPress={navigateToAbout}>
        <Text style={styles.buttonText}>Läs mer om oss</Text>
        <ArrowRight size={16} color={theme.colors.buttonText || theme.colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.darkCard || theme.colors.card,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 8,
  },
  buttonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
  },
});