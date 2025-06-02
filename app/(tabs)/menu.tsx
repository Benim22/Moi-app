import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, ActivityIndicator, Modal, TouchableOpacity, Dimensions, Platform, SafeAreaView as RNSafeAreaView, StatusBar, ToastAndroid, Alert, Pressable } from 'react-native';
import { globalStyles } from '@/constants/theme';
import MenuCard from '@/components/MenuCard';
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryFilter from '@/components/CategoryFilter';
import { Stack } from 'expo-router';
import { useMenuStore, MenuItem } from '@/store/menu-store';
import { X, Clock, Plus } from 'lucide-react-native';
import { useCartStore } from '@/store/cart-store';
import Footer from '@/components/Footer';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { useNotificationStore } from '@/store/notification-store';

// Definiera lokal menypetyp för att undvika typkonflikter
type MenuItemLocal = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  isPopular?: boolean;
  ingredients?: string[];
  allergens?: string[];
  preparation_time?: string;
  nutritional_info?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar?: number;
    salt?: number;
  };
  spicy_level?: number;
};

// Menumodal-komponent
const MenuItemModal = ({ isVisible, onClose, item, formatCategoryName }: { 
  isVisible: boolean; 
  onClose: () => void; 
  item: MenuItemLocal | null;
  formatCategoryName: (category: string) => string;
}) => {
  if (!item) return null;
  
  const [activeTab, setActiveTab] = useState('information');
  const { height, width } = Dimensions.get('window');
  const { addItem } = useCartStore();
  
  // Funktion för att lägga till i varukorg
  const handleAddToCart = () => {
    console.log('handleAddToCart anropas');
    
    try {
      // Skapa ett MenuItem-objekt som cart-store kan hantera
      const menuItem: MenuItem = {
        id: String(item.id),
        name: item.name,
        description: item.description || "",
        price: item.price || 0,
        image: item.image || "",
        category: item.category || "",
        popular: item.popular || item.isPopular || false,
        tags: [],
        ingredients: item.ingredients || [],
        allergens: item.allergens || []
      };
      
      // Använd addItem funktionen från cart-store som redan har logik för att öka kvantitet
      addItem(menuItem);
      
      // Visa bekräftelse och stäng
      Alert.alert('Tillagd', `${item.name} har lagts till i varukorgen`);
      onClose();
    } catch (error) {
      console.error('Fel:', error);
      Alert.alert('Fel', 'Kunde inte lägga till i varukorgen');
    }
  };

  // Konvertera till korrekt format för visning
  const ingredients = item.ingredients || [];
  const allergens = item.allergens || [];
  const nutrition = item.nutritional_info || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    salt: 0
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      style={styles.fullModal}
    >
      <RNSafeAreaView style={styles.fullModalContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header/Toppbild med gradient */}
        <View style={styles.modalHeader}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.headerImage} 
            resizeMode="cover"
          />
          <View style={styles.imageGradientOverlay} />
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            {(item.popular || item.isPopular) && (
              <View style={styles.popularTag}>
                <Text style={styles.popularTagText}>Populär</Text>
              </View>
            )}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{formatCategoryName(item.category)}</Text>
            </View>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View style={styles.priceTimeContainer}>
              <Text style={styles.itemPrice}>{item.price} kr</Text>
              <View style={styles.timeContainer}>
                <Clock size={16} color="#fff" />
                <Text style={styles.timeText}>{item.preparation_time || '15-20 min'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Actionknappar */}
        <View style={styles.actionContainer}>
          <Pressable 
            style={styles.addToCartButton} 
            onPress={handleAddToCart}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          >
            <Plus size={18} color="#fff" />
            <Text style={styles.addToCartText}>Lägg till</Text>
          </Pressable>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'information' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('information')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'information' && styles.activeTabText
            ]}>Information</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'nutrition' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('nutrition')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'nutrition' && styles.activeTabText
            ]}>Näringsvärde</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'allergens' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('allergens')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'allergens' && styles.activeTabText
            ]}>Allergener</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab innehåll */}
        <ScrollView style={styles.contentScrollView}>
          {activeTab === 'information' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Beskrivning</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
              
              <Text style={styles.sectionTitle}>Ingredienser</Text>
              <View style={styles.ingredientsContainer}>
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => (
                    <View key={`menu-modal-ingredient-${ingredient}-${index}`} style={styles.ingredientTag}>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Inga ingredienser listade</Text>
                )}
              </View>
            </View>
          )}
          
          {activeTab === 'nutrition' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Näringsvärde</Text>
              {nutrition ? (
                <View style={styles.nutritionTable}>
                  <View key="menu-modal-calories" style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Kalorier</Text>
                    <Text style={styles.nutritionValue}>{nutrition.calories} kcal</Text>
                  </View>
                  <View key="menu-modal-protein" style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{nutrition.protein} g</Text>
                  </View>
                  <View key="menu-modal-carbs" style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Kolhydrater</Text>
                    <Text style={styles.nutritionValue}>{nutrition.carbs} g</Text>
                  </View>
                  <View key="menu-modal-fat" style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Fett</Text>
                    <Text style={styles.nutritionValue}>{nutrition.fat} g</Text>
                  </View>
                  {nutrition.sugar !== undefined && (
                    <View key="menu-modal-sugar" style={styles.nutritionRow}>
                      <Text style={styles.nutritionLabel}>Socker</Text>
                      <Text style={styles.nutritionValue}>{nutrition.sugar} g</Text>
                    </View>
                  )}
                  {nutrition.salt !== undefined && (
                    <View key="menu-modal-salt" style={styles.nutritionRow}>
                      <Text style={styles.nutritionLabel}>Salt</Text>
                      <Text style={styles.nutritionValue}>{nutrition.salt} g</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.emptyText}>Näringsinformation saknas</Text>
              )}
            </View>
          )}
          
          {activeTab === 'allergens' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Allergener</Text>
              <View style={styles.allergensContainer}>
                {allergens.length > 0 ? (
                  allergens.map((allergen: string, index: number) => (
                    <View key={`menu-modal-allergen-${allergen}-${index}`} style={styles.allergenTag}>
                      <Text style={styles.allergenText}>{allergen}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Inga allergener listade</Text>
                )}
              </View>
              
              <Text style={styles.allergenDisclaimer}>
                Vänligen kontakta restaurangen om du har specifika allergier eller 
                intoleranser. Alla våra rätter kan innehålla spår av allergener.
              </Text>
            </View>
          )}
        </ScrollView>
      </RNSafeAreaView>
    </Modal>
  );
};

// Fast önskad ordning på kategorierna enligt användarens lista
// OBS: Lägg till både 'friterad sushi' och 'friterade rullar' för att täcka båda varianter
const CATEGORY_ORDER = [
  'sushi',
  'poké bowl',
  'friterad sushi', // backend-variant
  'friterade rullar', // visningsnamn
  'mix',
  'nigiri',
  'sashimi',
  'varmrätter',
  'vegetariskt',
  'veganskt',
  'barnmeny',
  'såser',
  'tillbehör',
  'drycker',
];

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItemLocal[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemLocal | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  // Använd MenuStore
  const { items: menuItems, categories: menuCategories, isLoading: loading, loadMenu } = useMenuStore();

  // Förladda viktiga bilder för snabbare laddning
  useImagePreloader({ 
    items: menuItems, 
    priority: 'high', 
    maxPreload: 15 // Förladda de första 15 bilderna
  });

  // Warm up cache för populära bilder när menyn laddats
  useEffect(() => {
    if (menuItems.length > 0) {
      const popularImages = menuItems
        .filter(item => item.popular && item.image)
        .map(item => item.image)
        .slice(0, 8); // Top 8 populära

      if (popularImages.length > 0) {
        // Kör async utan att blockera UI
        import('@/utils/imageCache').then(({ ImageCacheManager }) => {
          ImageCacheManager.warmUpCache(popularImages);
        });
      }
    }
  }, [menuItems]);

  // Hämta menyn från store när komponenten laddas
  useEffect(() => {
    loadMenu();
  }, []);

  // Formatera kategorinamn för visning
  const formatCategoryName = (category: string): string => {
    if (!category) return "Alla";
    switch (category.toLowerCase()) {
      case 'moisrolls':
        return 'Moi\'s Rolls';
      case 'poke bowl':
      case 'pokebowl':
      case 'pokebowls':
        return 'Poké Bowl';
      case 'friterad sushi':
        return 'Friterade Rullar';
      default:
        // Konvertera första bokstaven till versal
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Uppdatera kategorilistan när menuCategories ändras
  useEffect(() => {
    if (menuCategories && menuCategories.length > 0) {
      // Sortera kategorier enligt fast ordning
      const sortedCategories = [...menuCategories].sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a.toLowerCase());
        const bIndex = CATEGORY_ORDER.indexOf(b.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      const formattedCategories = sortedCategories.map(category => ({
        id: category,
        name: formatCategoryName(category)
      }));
      setCategories(formattedCategories);
      if (formattedCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(formattedCategories[0].id);
      }
    }
  }, [menuCategories]);

  // Filtrera när kategori ändras
  useEffect(() => {
    if (selectedCategory && menuItems.length > 0) {
      const filtered = menuItems.filter(item => item.category === selectedCategory);
      setFilteredItems(filtered);
    } else if (menuItems.length > 0) {
      setFilteredItems(menuItems);
    }
  }, [selectedCategory, menuItems]);

  const handleOpenModal = (item: MenuItemLocal) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
          <Text style={styles.loadingText}>Laddar meny...</Text>
        </View>
      ) : (
        <ScrollView style={globalStyles.container}>
          <View style={styles.header}>
            <Image 
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              onError={() => console.error('Kunde inte ladda logotypen')}
            />
            <Text style={styles.headerTitle}>Moi Meny</Text>
            <Text style={styles.headerSubtitle}>Förnyad och förbättrad</Text>
          </View>

          {categories.length > 0 && (
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
          
          <View style={styles.menuContainer}>
            <Text style={styles.categoryTitle}>
              {categories.find(cat => cat.id === selectedCategory)?.name || 'Alla kategorier'}
            </Text>
            
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <MenuCard 
                  key={item.id} 
                  item={item} 
                  onInfoPress={() => handleOpenModal(item)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Inga artiklar hittades i denna kategori.
                </Text>
              </View>
            )}
          </View>
          
          <Footer />
        </ScrollView>
      )}

      <MenuItemModal 
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        item={selectedItem}
        formatCategoryName={formatCategoryName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  menuContainer: {
    padding: theme.spacing.lg,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginBottom: 20,
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  
  notificationTestButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  notificationTestText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  
  // Modal stilar
  fullModal: {
    margin: 0,
    justifyContent: 'flex-start',
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  popularTag: {
    backgroundColor: theme.colors.gold,
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  popularTagText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  priceTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  actionContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addToCartButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.gold,
  },
  tabText: {
    color: theme.colors.subtext,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  contentScrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  ingredientTag: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  ingredientText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  nutritionTable: {
    marginBottom: 24,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  nutritionLabel: {
    color: theme.colors.text,
    fontSize: 16,
  },
  nutritionValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  allergenTag: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  allergenText: {
    color: '#f44336',
    fontSize: 14,
  },
  allergenDisclaimer: {
    color: theme.colors.subtext,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
