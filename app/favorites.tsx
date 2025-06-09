import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useFavoritesStore } from '@/store/favorites-store';
import { useMenuStore } from '@/store/menu-store';
import MenuItem from '@/components/MenuItem';
import BackButton from '@/components/BackButton';
import ScreenLayout from '@/components/ScreenLayout';
import { ArrowLeft, Heart } from 'lucide-react-native';
import Footer from '@/components/Footer';

export default function FavoritesScreen() {
  const { favorites, getFavorites, isLoading, removeFavorite } = useFavoritesStore();
  const { getMenuItemById, loadMenu, items } = useMenuStore();
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const router = useRouter();

  // Ladda menydata och favoriter när komponenten mountas
  useEffect(() => {
    const initialize = async () => {
      await loadMenu(); // Ladda menyn först
      await loadFavorites(); // Sedan ladda favoriter
    };
    
    initialize();
  }, []);

  const loadFavorites = async () => {
    try {
      await getFavorites();
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Uppdatera favoritlistan när favoriter eller menydata ändras
  useEffect(() => {
    if (favorites.length > 0 && items.length > 0) {
      try {
        const menuItems = favorites.map(fav => {
          const menuItem = getMenuItemById(fav.menu_item_id);
          return menuItem ? { ...menuItem, favoriteId: fav.id } : null;
        }).filter(Boolean);
        
        setFavoriteItems(menuItems);
      } catch (error) {
        console.error('Error processing favorites:', error);
      }
    } else {
      setFavoriteItems([]);
    }
  }, [favorites, items]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await removeFavorite(favoriteId);
      // Uppdatera UI direkt efter borttagning
      setFavoriteItems(current => current.filter(item => item.favoriteId !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Fel', 'Kunde inte ta bort favoriten');
    }
  };
  
  const EmptyFavorites = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Du har inga favoriträtter ännu. Utforska menyn och lägg till dina favoriter!
      </Text>
      <TouchableOpacity 
        style={styles.browseButton} 
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.browseButtonText}>Utforska menyn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Favoriter',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.text },
          headerShadowVisible: false,
          headerLeft: () => (
            <BackButton 
              title=""
              variant="gold"
              size={26}
              style={styles.headerBackButton}
            />
          ),
        }}
      />
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.gold} />
          </View>
        ) : favoriteItems.length === 0 ? (
          <ScrollView style={styles.scrollView}>
            <EmptyFavorites />
            <Footer />
          </ScrollView>
        ) : (
          <FlatList
            data={favoriteItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.menuItemContainer}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price} kr</Text>
                  </View>
                  
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  
                  <Pressable 
                    style={styles.favoriteButton}
                    onPress={() => handleRemoveFavorite(item.favoriteId)}
                  >
                    <Heart 
                      size={22} 
                      color={theme.colors.error}
                      fill={theme.colors.error}
                    />
                  </Pressable>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={<Footer />}
            ListFooterComponentStyle={styles.footerContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  footerContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  listContent: {
    padding: 16,
    paddingTop: 16,
  },
  headerBackButton: {
    backgroundColor: theme.colors.gold,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  browseButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonText: {
    color: theme.colors.buttonText || '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuItemContainer: {
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
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginLeft: 8,
  },
  itemDescription: {
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