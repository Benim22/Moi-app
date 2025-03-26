import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Dimensions,
  Platform,
  BackHandler,
  Pressable
} from 'react-native';
import { X, AlertCircle, Plus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { MenuItem } from '@/store/menu-store';
import { useCartStore } from '@/store/cart-store';

interface MenuItemInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

const { width } = Dimensions.get('window');

// Ändra till React.memo utan separat FC-deklaration först
const MenuItemInfoModal = React.memo(({ 
  isVisible, 
  onClose, 
  item 
}: MenuItemInfoModalProps) => {
  const addToCart = useCartStore(state => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  
  // Använd Android back-knapp för att stänga modalen
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isVisible, onClose]);

  // Hantera tillägg till varukorg
  const handleAddToCart = () => {
    if (item) {
      setIsAdding(true);
      addToCart(item);
      
      // Visa en kort visuell indikation
      setTimeout(() => {
        setIsAdding(false);
        onClose();
      }, 500);
    }
  };

  // Returnera null om item är null, undefined eller saknar nödvändiga egenskaper
  if (!item || !item.name || !item.price) return null;

  // Kontrollera om nutritionalValues och allergens finns och har värden
  const hasNutritionalValues = 
    item.nutritionalValues && 
    Object.values(item.nutritionalValues).some(value => value !== undefined && value !== null);

  const hasAllergens = item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0;

  // Säkert hantera beskrivningstext
  const description = item.description || 'Ingen beskrivning tillgänglig';

  // Mappa kategorinamn
  const getCategoryName = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      'moisRolls': 'Mois Rolls',
      'helfriterade': 'Helfriterade Maki',
      'friterade': 'Friterade Maki',
      'pokebowls': 'Pokébowls',
      'nigiri': 'Nigiri',
      'combo': 'Nigiri Combo',
      'comboratts': 'Combo Rätter',
      'delikatesser': 'Exotiska Delikatesser',
      'delicacies': 'Delikatesser',
      'barn': 'Barnmenyer',
      'barnmeny': 'För Barn',
      'smatt': 'Smått Och Gott',
      'sides': 'Tillbehör',
      'saser': 'Våra Såser',
      'drycker': 'Uppfriskande Drycker',
      'drinks': 'Dryck',
      'nigiriPar': 'Nigiri i Par'
    };
    
    return categoryMap[category] || category;
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {item.image ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={styles.imagePlaceholderText}>Ingen bild tillgänglig</Text>
              </View>
            )}
            
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>{item.price} kr</Text>
              <Text style={styles.description}>{description}</Text>
              
              {hasNutritionalValues && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Näringsvärde</Text>
                  <View style={styles.nutritionalGrid}>
                    {item.nutritionalValues?.calories !== undefined && (
                      <View key="calories-info" style={styles.nutritionalItem}>
                        <Text style={styles.nutritionalValue}>{item.nutritionalValues.calories}</Text>
                        <Text style={styles.nutritionalLabel}>kcal</Text>
                      </View>
                    )}
                    {item.nutritionalValues?.protein !== undefined && (
                      <View key="protein-info" style={styles.nutritionalItem}>
                        <Text style={styles.nutritionalValue}>{item.nutritionalValues.protein}g</Text>
                        <Text style={styles.nutritionalLabel}>Protein</Text>
                      </View>
                    )}
                    {item.nutritionalValues?.carbs !== undefined && (
                      <View key="carbs-info" style={styles.nutritionalItem}>
                        <Text style={styles.nutritionalValue}>{item.nutritionalValues.carbs}g</Text>
                        <Text style={styles.nutritionalLabel}>Kolhydrater</Text>
                      </View>
                    )}
                    {item.nutritionalValues?.fat !== undefined && (
                      <View key="fat-info" style={styles.nutritionalItem}>
                        <Text style={styles.nutritionalValue}>{item.nutritionalValues.fat}g</Text>
                        <Text style={styles.nutritionalLabel}>Fett</Text>
                      </View>
                    )}
                    {item.nutritionalValues?.sugar !== undefined && (
                      <View key="sugar-info" style={styles.nutritionalItem}>
                        <Text style={styles.nutritionalValue}>{item.nutritionalValues.sugar}g</Text>
                        <Text style={styles.nutritionalLabel}>Socker</Text>
                      </View>
                    )}
                    {item.nutritionalValues?.salt !== undefined && (
                      <View key="salt-info" style={styles.nutritionalItem}>
                        <Text style={styles.nutritionalValue}>{item.nutritionalValues.salt}g</Text>
                        <Text style={styles.nutritionalLabel}>Salt</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {hasAllergens && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Allergener</Text>
                  <View style={styles.allergensContainer}>
                    <AlertCircle size={20} color={"#f1c40f"} style={styles.allergenIcon} />
                    <Text style={styles.allergensText}>
                      {item.allergens?.join(', ')}
                    </Text>
                  </View>
                </View>
              )}
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kategori</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {getCategoryName(item.category)}
                  </Text>
                </View>
              </View>
              
              <Pressable 
                style={[styles.addButton, isAdding && styles.addingButton]} 
                onPress={handleAddToCart}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <Plus size={18} color="#fff" />
                <Text style={styles.addButtonText}>
                  {isAdding ? 'Tillagd i varukorgen' : 'Lägg till i varukorgen'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

// Exportera komponenten direkt utan att använda React.memo igen
export default MenuItemInfoModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    // Säkerställ att modalen täcker hela skärmen även på mobila enheter
    ...Platform.select({
      ios: {
        paddingTop: 20
      },
      android: {
        paddingTop: 0
      }
    })
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    // Lägg till skugga för bättre synlighet
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 8,
    // Öka storleken för bättre tryckbarhet på mobila enheter
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: theme.colors.subtext,
    fontSize: 16,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  nutritionalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  nutritionalItem: {
    width: '33.33%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  nutritionalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  nutritionalLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginTop: 4,
  },
  allergensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
  },
  allergenIcon: {
    marginRight: theme.spacing.sm,
  },
  allergensText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: theme.colors.gold,
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  addingButton: {
    backgroundColor: theme.colors.success || '#4CAF50',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});