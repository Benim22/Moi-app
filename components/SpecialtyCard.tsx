import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { theme } from '@/constants/theme';
import { ArrowRight } from 'lucide-react-native';
import OptimizedImage from '@/components/OptimizedImage';

interface SpecialtyCardProps {
  title: string;
  description: string;
  imageUrl: string | ImageSourcePropType;
  onPress?: () => void;
}

export default function SpecialtyCard({ title, description, imageUrl, onPress }: SpecialtyCardProps) {
  // Hantera både lokala bilder (require) och URL:er
  const imageSource = typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;
  
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <OptimizedImage 
        source={imageSource} 
        style={styles.image}
        width={600}
        height={300}
        quality={75}
        resize="cover"
        priority="high"
        cachePolicy="disk"
        onError={() => console.error('SpecialtyCard: Kunde inte ladda bild')}
      />
      {/* Gradient overlay bara i botten för text */}
      <View style={styles.gradientOverlay}>
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%', // Bara nedre 60% av bilden
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    // För React Native använder vi detta istället:
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  content: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)', // Lätt bakgrund för text
    borderRadius: theme.borderRadius.sm,
    margin: theme.spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff', // Vit text för bättre kontrast
    marginBottom: theme.spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)', // Nästan vit för beskrivning
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.gold, // Guld för länktext
    marginRight: theme.spacing.xs,
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
  },
});