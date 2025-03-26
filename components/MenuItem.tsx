import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Heart } from 'lucide-react-native';

type MenuItemType = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  favoriteId?: string;
};

type MenuItemProps = {
  item: MenuItemType;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
};

export default function MenuItem({ item, isFavorite = false, onFavoritePress }: MenuItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/menu-item/${item.id}`);
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.9 }
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>{item.price} kr</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        {onFavoritePress && (
          <Pressable 
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
          >
            <Heart 
              size={22} 
              color={isFavorite ? theme.colors.error : theme.colors.subtext}
              fill={isFavorite ? theme.colors.error : 'transparent'}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 18,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 5,
  },
}); 