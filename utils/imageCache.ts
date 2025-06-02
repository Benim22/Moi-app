import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_CACHE_KEY = 'image_cache_timestamp';

export class ImageCacheManager {
  
  // Helper för att skapa optimerade Supabase URLs
  private static createOptimizedSupabaseUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    resize?: string;
  }): string {
    if (originalUrl.includes('.supabase.co/storage/v1/object/public/')) {
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
      return paramString ? `${transformUrl}?${paramString}` : transformUrl;
    }
    
    return originalUrl;
  }
  
  // Rensa all bildcache
  static async clearAll(): Promise<void> {
    try {
      await Image.clearDiskCache();
      await Image.clearMemoryCache();
      await AsyncStorage.setItem(IMAGE_CACHE_KEY, Date.now().toString());
      console.log('🧹 Bildcache rensad');
    } catch (error) {
      console.error('Fel vid rensning av bildcache:', error);
      throw error;
    }
  }

  // Hämta cache-storlek (ungefärlig)
  static async getCacheInfo(): Promise<{ lastCleared: Date | null }> {
    try {
      const timestamp = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
      return {
        lastCleared: timestamp ? new Date(parseInt(timestamp)) : null
      };
    } catch (error) {
      console.error('Fel vid hämtning av cache-info:', error);
      return { lastCleared: null };
    }
  }

  // Förladda optimerade bilder med olika storlekar
  static async preloadImagesWithSizes(imageUrls: string[]): Promise<void> {
    try {
      const sizes = [
        { width: 400, height: 240, quality: 60 }, // Lista/thumb
        { width: 600, height: 300, quality: 75 }, // Specialty cards
        { width: 800, height: 400, quality: 80 }, // Modal/fullscreen
      ];

      const promises = imageUrls.flatMap(url =>
        sizes.map(size => {
          const optimizedUrl = this.createOptimizedSupabaseUrl(url, {
            ...size,
            resize: 'cover'
          });
          return Image.prefetch(optimizedUrl, {
            priority: 'normal',
            cachePolicy: 'disk'
          });
        })
      );
      
      await Promise.allSettled(promises);
      console.log(`🚀 Förladdat ${imageUrls.length} bilder i ${sizes.length} storlekar`);
    } catch (error) {
      console.error('Fel vid förladdning:', error);
    }
  }

  // Förladda specifika bilder med custom inställningar
  static async preloadOptimizedImages(
    imageUrls: string[], 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      resize?: string;
    } = {}
  ): Promise<void> {
    try {
      const defaultOptions = {
        width: 400,
        height: 240,
        quality: 70,
        resize: 'cover',
        ...options
      };

      const promises = imageUrls.map(url => {
        const optimizedUrl = this.createOptimizedSupabaseUrl(url, defaultOptions);
        return Image.prefetch(optimizedUrl, {
          priority: 'high',
          cachePolicy: 'disk'
        });
      });
      
      await Promise.allSettled(promises);
      console.log(`✨ Förladdat ${imageUrls.length} optimerade bilder`);
    } catch (error) {
      console.error('Fel vid förladdning:', error);
    }
  }

  // Optimera cache genom att rensa gamla bilder
  static async optimizeCache(): Promise<void> {
    try {
      // Rensa bara memory cache för att frigöra RAM
      await Image.clearMemoryCache();
      console.log('💾 Memory cache optimerad');
    } catch (error) {
      console.error('Fel vid cache-optimering:', error);
    }
  }

  // Warm up cache med populära bilder
  static async warmUpCache(popularImageUrls: string[]): Promise<void> {
    console.log('🔥 Värmer upp cache med populära bilder...');
    await this.preloadImagesWithSizes(popularImageUrls.slice(0, 5)); // Top 5
  }
} 