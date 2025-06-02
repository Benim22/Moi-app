import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { theme } from '@/constants/theme';

interface OptimizedImageProps {
  source: ImageSource;
  style?: ViewStyle;
  width?: number;
  height?: number;
  quality?: number; // 20-100, default 80
  resize?: 'cover' | 'contain' | 'fill';
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'disk' | 'memory' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

// Tillfällig toggle för att testa utan transformations
const ENABLE_SUPABASE_TRANSFORMATIONS = false; // Sätter till false för testning

// Helper för att skapa optimerade Supabase URLs
function createOptimizedSupabaseUrl(originalUrl: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  resize?: string;
}): string {
  // Tillfälligt inaktiverad för testning
  if (!ENABLE_SUPABASE_TRANSFORMATIONS) {
    console.log('🚫 Supabase transformations inaktiverade, använder original URL');
    return originalUrl;
  }

  // Kolla om det är en Supabase Storage URL
  if (originalUrl.includes('.supabase.co/storage/v1/object/public/')) {
    // Konvertera till render/image endpoint för transformation
    const transformUrl = originalUrl.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    
    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.resize) params.append('resize', options.resize);
    
    const paramString = params.toString();
    const finalUrl = paramString ? `${transformUrl}?${paramString}` : transformUrl;
    
    console.log('🔗 URL Transform:', {
      original: originalUrl,
      transformed: finalUrl
    });
    
    return finalUrl;
  }
  
  console.log('⚠️ Inte Supabase URL, använder original:', originalUrl);
  // Om det inte är Supabase, returnera original URL
  return originalUrl;
}

export default function OptimizedImage({ 
  source, 
  style, 
  width = 400,
  height = 400,
  quality = 75, // Lägre kvalitet för snabbare laddning
  resize = 'cover',
  priority = 'normal',
  cachePolicy = 'disk',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useOptimized, setUseOptimized] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (useOptimized && typeof source === 'object' && 'uri' in source && source.uri) {
      // Om optimerad bild misslyckades, prova original
      console.log('🔄 Optimerad bild misslyckades, provar original...');
      setUseOptimized(false);
      setIsLoading(true);
      setHasError(false);
      return;
    }
    
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Skapa bildkälla baserat på om vi ska använda optimerad version eller inte
  let imageSource: ImageSource;

  if (typeof source === 'object' && 'uri' in source && source.uri && useOptimized) {
    // Försök med optimerad URL först
    const optimizedUri = createOptimizedSupabaseUrl(source.uri, {
      width,
      height,
      quality,
      resize
    });
    imageSource = { ...source, uri: optimizedUri };
  } else {
    // Använd original källa (antingen lokal bild eller original URL)
    imageSource = source;
  }

  // Blurhash placeholder för smidig laddning
  const blurhashPlaceholder = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={StyleSheet.absoluteFillObject}
        contentFit={resize}
        priority={priority}
        cachePolicy={cachePolicy}
        placeholder={{ blurhash: blurhashPlaceholder }}
        onLoad={handleLoad}
        onError={handleError}
        transition={200}
      />
      
      {/* Loading indicator */}
      {isLoading && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.gold} />
        </View>
      )}
      
      {/* Error state */}
      {hasError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorPlaceholder} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: theme.colors.card,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  errorPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
  },
}); 