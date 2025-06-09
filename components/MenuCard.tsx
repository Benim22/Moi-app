import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { theme } from '@/constants/theme';
import { MenuItem } from '@/store/menu-store';
import { Plus, Heart, Info, Check } from 'lucide-react-native';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useUserStore } from '@/store/user-store';
import OptimizedImage from '@/components/OptimizedImage';

interface MenuCardProps {
  item: MenuItem;
  onPress?: () => void;
  onInfoPress?: (item: MenuItem) => void;
}

export default function MenuCard({ item, onPress, onInfoPress }: MenuCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { isLoggedIn } = useUserStore();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Kontrollera om rätten är favorit när komponenten laddas
  useEffect(() => {
    setIsFavorited(isFavorite(item.id));
  }, [item.id, isFavorite]);
  
  useEffect(() => {
    if (isAddingToCart) {
      const timer = setTimeout(() => {
        setIsAddingToCart(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isAddingToCart]);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    try {
      addItem(item);
      
              // Endast logga - ingen toast
        console.log(`${item.name} tillagd i varukorgen`);
      
    } catch (error) {
      console.error('Fel vid tillägg i varukorgen:', error);
      setIsAddingToCart(false);
              console.error('Kunde inte lägga till produkten i varukorgen');
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
              console.log('Du måste vara inloggad för att spara favoriter');
      return;
    }
    
    try {
      await toggleFavorite(item);
      setIsFavorited(!isFavorited); // Uppdatera UI direkt
    } catch (error) {
      console.error('Fel vid hantering av favorit:', error);
              console.error('Kunde inte uppdatera favoriter');
    }
  };

  const handleInfoPress = () => {
    if (onInfoPress) {
      onInfoPress(item);
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        <OptimizedImage 
          source={{ uri: item.image }} 
          style={styles.image}
          width={400}
          height={240}
          quality={70}
          resize="cover"
          priority="high"
          cachePolicy="disk"
          onError={() => console.error(`Kunde inte ladda bild för ${item.name}`)}
        />
        {(item.isPopular || item.popular) && (
          <View style={styles.popularTag}>
            <Text style={styles.popularTagText}>Populär</Text>
          </View>
        )}
        {isLoggedIn && (
          <Pressable 
            style={[
              styles.favoriteButton,
              isFavorited && styles.favoriteButtonActive
            ]} 
            onPress={handleToggleFavorite}
          >
            <Heart 
              size={18} 
              color={isFavorited ? "#fff" : theme.colors.text} 
              fill={isFavorited ? theme.colors.gold : "transparent"} 
            />
          </Pressable>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price} kr</Text>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.infoButton} onPress={handleInfoPress}>
            <Info size={18} color={theme.colors.text} />
            <Text style={styles.infoButtonText}>Info</Text>
          </Pressable>
          <Pressable 
            style={[
              styles.addButton,
              isAddingToCart && styles.addButtonSuccess
            ]} 
            onPress={handleAddToCart}
          >
            {isAddingToCart ? (
              <>
                <Check size={18} color={theme.colors.background} />
                <Text style={styles.addButtonText}>Tillagd</Text>
              </>
            ) : (
              <>
                <Plus size={18} color={theme.colors.background} />
                <Text style={styles.addButtonText}>Lägg till</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gold,
  },
  description: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  popularTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: theme.colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  popularTagText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: theme.colors.background,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.gold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoButtonText: {
    color: theme.colors.text,
    fontWeight: '500',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  addButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
    marginLeft: 4,
  },
  addButtonSuccess: {
    backgroundColor: '#2ecc71',
  },
});