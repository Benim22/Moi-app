import { useEffect } from 'react';
import { Image } from 'expo-image';
import { MenuItem } from '@/store/menu-store';

interface UseImagePreloaderProps {
  items: MenuItem[];
  priority?: 'low' | 'normal' | 'high';
  maxPreload?: number;
}

// Helper för att skapa optimerade Supabase URLs
function createOptimizedSupabaseUrl(originalUrl: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  resize?: string;
}): string {
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
    return paramString ? `${transformUrl}?${paramString}` : transformUrl;
  }
  
  return originalUrl;
}

export function useImagePreloader({ 
  items, 
  priority = 'normal', 
  maxPreload = 10 
}: UseImagePreloaderProps) {
  
  useEffect(() => {
    if (!items?.length) return;

    // Prioritera populära rätter först, sedan första X
    const sortedItems = [...items].sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    });

    // Förladda de första X bilderna med optimerad storlek
    const itemsToPreload = sortedItems
      .filter(item => item.image && item.image.trim() !== '')
      .slice(0, maxPreload);

    const preloadPromises = itemsToPreload.map(item => {
      // Skapa optimerad URL för preloading (mindre storlek för snabbare preload)
      const optimizedUrl = createOptimizedSupabaseUrl(item.image, {
        width: 400,
        height: 240,
        quality: 60, // Lägre kvalitet för preload
        resize: 'cover'
      });

      return Image.prefetch(optimizedUrl, 'disk' as any);
    });

    // Kör alla preload-requests parallellt
    Promise.allSettled(preloadPromises)
      .then(results => {
        const successful = results.filter(result => result.status === 'fulfilled').length;
        console.log(`🚀 Förladdat ${successful}/${itemsToPreload.length} optimerade menybilder`);
      })
      .catch(error => {
        console.error('Fel vid förladdning av optimerade bilder:', error);
      });

  }, [items, priority, maxPreload]);
}

// Utility för att förladda specifika optimerade bilder
export function preloadOptimizedImages(
  imageUrls: string[], 
  priority: 'low' | 'normal' | 'high' = 'normal',
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    resize?: string;
  }
) {
  const defaultOptions = {
    width: 400,
    height: 240,
    quality: 70,
    resize: 'cover',
    ...options
  };

  return Promise.allSettled(
    imageUrls.map(url => {
      const optimizedUrl = createOptimizedSupabaseUrl(url, defaultOptions);
      return Image.prefetch(optimizedUrl, 'disk' as any);
    })
  );
} 