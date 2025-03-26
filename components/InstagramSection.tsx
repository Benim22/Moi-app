import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Linking } from 'react-native';
import { theme } from '@/constants/theme';
import { ExternalLink, Instagram } from 'lucide-react-native';

const instagramImages = [
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1617196034183-421b4917c92d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1559410545-0bdcd187e323?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1534482421-64566f976cfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1563612116625-9a3203a7c486?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
];

export default function InstagramSection() {
  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/moisushi.se');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Instagram size={24} color="#E1306C" />
        <Text style={styles.title}>@moisushi.se</Text>
      </View>
      <Text style={styles.subtitle}>Följ oss på Instagram</Text>
      
      <View style={styles.grid}>
        {instagramImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        ))}
      </View>
      
      <Pressable style={styles.button} onPress={openInstagram}>
        <Text style={styles.buttonText}>Visa profil</Text>
        <ExternalLink size={16} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    gap: 8,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});