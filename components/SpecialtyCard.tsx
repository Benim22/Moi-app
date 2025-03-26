import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { theme } from '@/constants/theme';
import { ArrowRight } from 'lucide-react-native';

interface SpecialtyCardProps {
  title: string;
  description: string;
  imageUrl: string;
  onPress?: () => void;
}

export default function SpecialtyCard({ title, description, imageUrl, onPress }: SpecialtyCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Se meny</Text>
            <ArrowRight size={16} color={theme.colors.text} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.sm,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
    fontSize: 14,
    fontWeight: '600',
  },
});