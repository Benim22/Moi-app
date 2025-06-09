import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  StatusBar,
  Modal,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/user-store';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  ShoppingBag, 
  Settings, 
  Edit, 
  Trash, 
  Plus,
  Search,
  Filter,
  X,
  ChevronDown,
  Image as ImageIcon,
  Bell,
  Calendar,
  User,
  CheckCircle,
  Eye,
  Clock,
  Check,
  AlertTriangle,
  MapPin,
  Globe,
  Mail,
  Phone,
  Save
} from 'lucide-react-native';
import { useMenuStore } from '@/store/menu-store';
import ImagePickerModal from '@/components/Admin/ImagePickerModal';
import { useNotificationStore } from '@/store/notification-store';
import { NotificationManager } from '@/utils/NotificationManager';
import { useRestaurantStore } from '@/store/restaurant-store';

// Våra lokala typer
type MenuItem = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  popular?: boolean;
  ingredients?: string[];
  allergens?: string[];
  preparation_time?: string;
  spicy_level?: number;
  tags?: string[];
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

// ExtendedMenuItem är samma som MenuItem men med isPopular för kompabilitet
type ExtendedMenuItem = MenuItem & {
  isPopular?: boolean;
};

// Ny komponent för att lägga till en ny maträtt
const AddMenuItemModal = ({ 
  visible, 
  onClose, 
  onAdd 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onAdd: (item: Omit<MenuItem, 'id'>) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('https://img.freepik.com/free-photo/delicious-japanese-food-arrangement_23-2149016018.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [popular, setPopular] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [ingredients, setIngredients] = useState<string>('');
  const [allergens, setAllergens] = useState<string>('');
  const [preparation_time, setPreparation_time] = useState('15-20 min');
  const [spicy_level, setSpicy_level] = useState('0');
  const [tags, setTags] = useState<string>('');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Lista över befintliga kategorier
  const categories = [
    'Sushi', 
    'Maki', 
    'Nigiri', 
    'Sashimi', 
    'Friterad Sushi', 
    'Poké Bowl', 
    'Mix', 
    'Varmrätter', 
    'Tillbehör', 
    'Drycker', 
    'Såser', 
    'Barnmeny', 
    'Vegetariskt',
    'Veganskt'
  ];

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImage('https://img.freepik.com/free-photo/delicious-japanese-food-arrangement_23-2149016018.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid');
    setCategory('');
    setPopular(false);
    setShowCategoryDropdown(false);
    setNewCategoryName('');
    setIngredients('');
    setAllergens('');
    setPreparation_time('15-20 min');
    setSpicy_level('0');
    setTags('');
    setCalories('0');
    setProtein('0');
    setCarbs('0');
    setFat('0');
    setShowImagePicker(false);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      setCategory(newCategoryName.trim());
      setShowNewCategoryModal(false);
      setShowCategoryDropdown(false);
      setNewCategoryName('');
    } else {
      Alert.alert('Fel', 'Kategorinamn får inte vara tomt');
    }
  };

  const handleSubmit = async () => {
    // Validera indata
    if (!name || !description || !price || !category) {
      Alert.alert('Fel', 'Alla fält måste fyllas i');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Fel', 'Priset måste vara ett positivt nummer');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(item => item);
      const allergensArray = allergens.split(',').map(item => item.trim()).filter(item => item);
      const tagsArray = tags.split(',').map(item => item.trim()).filter(item => item);
      
      await onAdd({
        name,
        description,
        price: priceValue,
        image,
        category,
        popular,
        ingredients: ingredientsArray,
        allergens: allergensArray,
        preparation_time,
        spicy_level: parseInt(spicy_level) || 0,
        tags: tagsArray,
        nutritional_info: {
          calories: parseInt(calories) || 0,
          protein: parseInt(protein) || 0,
          carbs: parseInt(carbs) || 0,
          fat: parseInt(fat) || 0,
        }
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding menu item:', error);
      Alert.alert('Fel', 'Kunde inte lägga till menyobjektet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelected = (url: string) => {
    setImage(url);
    setShowImagePicker(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lägg till ny maträtt</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Namn</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Maträttens namn"
                placeholderTextColor={theme.colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Beskrivning</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Beskrivning av maträtten"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pris (kr)</Text>
              <TextInput
                style={styles.formInput}
                value={price}
                onChangeText={setPrice}
                placeholder="Pris i kronor"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bild</Text>
              <View style={styles.imageInputContainer}>
                <TextInput
                  style={styles.formInputWithButton}
                  value={image}
                  onChangeText={setImage}
                  placeholder="URL till bild eller välj från bibliotek"
                  placeholderTextColor={theme.colors.subtext}
                />
                <TouchableOpacity 
                  style={styles.imagePickerButton} 
                  onPress={() => setShowImagePicker(true)}
                >
                  <ImageIcon size={20} color={theme.colors.gold} />
                </TouchableOpacity>
              </View>
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.previewImage, styles.imagePlaceholder]}>
                  <ImageIcon size={40} color={theme.colors.subtext} />
                  <Text style={styles.imagePlaceholderText}>Ingen bild vald</Text>
                </View>
              )}
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, popular && styles.checkboxChecked]}
                onPress={() => setPopular(!popular)}
              >
                {popular && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Markera som populär</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kategori</Text>
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={category ? styles.categoryText : styles.placeholderText}>
                  {category || "Välj kategori"}
                </Text>
                <ChevronDown size={18} color={theme.colors.subtext} />
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <Modal
                  visible={showCategoryDropdown}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowCategoryDropdown(false)}
                >
                  <TouchableOpacity 
                    style={styles.dropdownBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                  >
                    <View style={styles.dropdownContainer}>
                      <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownTitle}>Välj kategori</Text>
                        <TouchableOpacity
                          onPress={() => setShowCategoryDropdown(false)}
                        >
                          <X size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                      </View>
                      <ScrollView 
                        style={styles.dropdown}
                        contentContainerStyle={styles.dropdownContentContainer} 
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        persistentScrollbar={true}
                        scrollEnabled={true}
                        alwaysBounceVertical={true}
                      >
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.dropdownItem, 
                              category === cat && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text 
                              style={[
                                styles.dropdownItemText,
                                category === cat && styles.dropdownItemTextSelected
                              ]}
                            >
                              {cat}
                            </Text>
                            {category === cat && (
                              <View style={styles.selectedMark}>
                                <Text style={styles.selectedMarkText}>✓</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <TouchableOpacity
                        style={styles.addNewCategoryItem}
                        onPress={() => {
                          setShowNewCategoryModal(true);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <View style={styles.addNewCategoryRow}>
                          <Plus size={16} color={theme.colors.gold} />
                          <Text style={styles.addNewCategoryText}>Lägg till ny kategori</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ingredienser (separerade med komma)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="t.ex. ris, lax, avokado"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Allergener (separerade med komma)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={allergens}
                onChangeText={setAllergens}
                placeholder="t.ex. gluten, skaldjur, soja"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Taggar (separerade med komma)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={tags}
                onChangeText={setTags}
                placeholder="t.ex. vegetarisk, vegansk, glutenfri"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tillagningstid</Text>
              <TextInput
                style={styles.formInput}
                value={preparation_time}
                onChangeText={setPreparation_time}
                placeholder="t.ex. 15-20 min"
                placeholderTextColor={theme.colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Styrkenivå (0-5)</Text>
              <TextInput
                style={styles.formInput}
                value={spicy_level}
                onChangeText={setSpicy_level}
                placeholder="0"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Näringsinformation</Text>
              <View style={styles.nutritionInputRow}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Kalorier</Text>
                  <TextInput
                    style={styles.formInput}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
              </View>
              <View style={styles.nutritionInputRow}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Kolhydrater (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Fett (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Spara</Text>
              )}
            </TouchableOpacity>
          </View>

          <ImagePickerModal
            visible={showImagePicker}
            onClose={() => setShowImagePicker(false)}
            onImageSelect={handleImageSelected}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Modal för att lägga till ny kategori */}
      <Modal
        visible={showNewCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNewCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lägg till ny kategori</Text>
              <TouchableOpacity onPress={() => setShowNewCategoryModal(false)}>
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.smallModalContent}>
              <Text style={styles.formLabel}>Kategorinamn</Text>
              <TextInput
                style={styles.formInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Ange namn på ny kategori"
                placeholderTextColor={theme.colors.subtext}
                autoFocus
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNewCategoryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddNewCategory}
              >
                <Text style={styles.submitButtonText}>Lägg till</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Ny komponent för att redigera en befintlig maträtt
const EditMenuItemModal = ({ 
  visible, 
  onClose, 
  onSave,
  menuItem
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSave: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  menuItem: MenuItem | null;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [popular, setPopular] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [ingredients, setIngredients] = useState<string>('');
  const [allergens, setAllergens] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [preparation_time, setPreparation_time] = useState('');
  const [spicy_level, setSpicy_level] = useState(0);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Lista över befintliga kategorier
  const categories = [
    'Sushi', 
    'Maki', 
    'Nigiri', 
    'Sashimi', 
    'Friterad Sushi', 
    'Poké Bowl', 
    'Mix', 
    'Varmrätter', 
    'Tillbehör', 
    'Drycker', 
    'Såser', 
    'Barnmeny', 
    'Vegetariskt',
    'Veganskt'
  ];

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name || '');
      setDescription(menuItem.description || '');
      setPrice(menuItem.price?.toString() || '');
      setImage(menuItem.image || '');
      setCategory(menuItem.category || '');
      setPopular(menuItem.popular || false);
      setIngredients(menuItem.ingredients?.join(',') || '');
      setAllergens(menuItem.allergens?.join(',') || '');
      setTags(menuItem.tags?.join(',') || '');
      setPreparation_time(menuItem.preparation_time || '15-20 min');
      setSpicy_level(menuItem.spicy_level || 0);
      
      // Initialize nutritional info
      if (menuItem.nutritional_info) {
        setCalories(menuItem.nutritional_info.calories || 0);
        setProtein(menuItem.nutritional_info.protein || 0);
        setCarbs(menuItem.nutritional_info.carbs || 0);
        setFat(menuItem.nutritional_info.fat || 0);
      } else {
        // Sätt defaultvärden om nutritional_info är null/undefined
        setCalories(0);
        setProtein(0);
        setCarbs(0);
        setFat(0);
      }
    } else {
        // Återställ formuläret om inget menuItem är valt (t.ex. när modalen stängs och öppnas igen)
        setName('');
        setDescription('');
        setPrice('');
        setImage('');
        setCategory('');
        setPopular(false);
        setIngredients('');
        setAllergens('');
        setTags('');
        setPreparation_time('15-20 min');
        setSpicy_level(0);
        setCalories(0);
        setProtein(0);
        setCarbs(0);
        setFat(0);
    }
    setShowImagePicker(false); // Se till att bildväljaren är stängd när item ändras
  }, [menuItem]);

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      setCategory(newCategoryName.trim());
      setShowNewCategoryModal(false);
      setShowCategoryDropdown(false);
      setNewCategoryName('');
    } else {
      Alert.alert('Fel', 'Kategorinamn får inte vara tomt');
    }
  };

  const handleImageSelected = (url: string) => {
    setImage(url);
    setShowImagePicker(false);
  };

  const handleSubmit = async () => {
    // Validera indata
    if (!name || !description || !price || !category) {
      Alert.alert('Fel', 'Namn, beskrivning, pris och kategori måste fyllas i');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Fel', 'Priset måste vara ett positivt nummer');
      return;
    }

    if (!menuItem?.id) {
      Alert.alert('Fel', 'Inget giltigt ID för menyobjektet');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Konvertera ingredienser och allergener till arrayer
      const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(item => item);
      const allergensArray = allergens.split(',').map(item => item.trim()).filter(item => item);
      const tagsArray = tags.split(',').map(item => item.trim()).filter(item => item);
      
      await onSave(menuItem.id, {
        name,
        description,
        price: priceValue,
        image,
        category,
        popular,
        ingredients: ingredientsArray,
        allergens: allergensArray,
        tags: tagsArray,
        preparation_time,
        spicy_level,
        nutritional_info: {
          calories,
          protein,
          carbs,
          fat
        }
      });

      onClose();
    } catch (error) {
      console.error('Error updating menu item:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera menyobjektet');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!menuItem) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redigera maträtt</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Namn</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Maträttens namn"
                placeholderTextColor={theme.colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Beskrivning</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Beskrivning av maträtten"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pris (kr)</Text>
              <TextInput
                style={styles.formInput}
                value={price}
                onChangeText={setPrice}
                placeholder="Pris i kronor"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bild</Text>
              <View style={styles.imageInputContainer}>
                <TextInput
                  style={styles.formInputWithButton}
                  value={image}
                  onChangeText={setImage}
                  placeholder="URL till bild eller välj från bibliotek"
                  placeholderTextColor={theme.colors.subtext}
                />
                <TouchableOpacity 
                  style={styles.imagePickerButton} 
                  onPress={() => setShowImagePicker(true)}
                >
                  <ImageIcon size={20} color={theme.colors.gold} />
                </TouchableOpacity>
              </View>
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.previewImage, styles.imagePlaceholder]}>
                  <ImageIcon size={40} color={theme.colors.subtext} />
                  <Text style={styles.imagePlaceholderText}>Ingen bild vald</Text>
                </View>
              )}
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, popular && styles.checkboxChecked]}
                onPress={() => setPopular(!popular)}
              >
                {popular && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Markera som populär</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kategori</Text>
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={category ? styles.categoryText : styles.placeholderText}>
                  {category || "Välj kategori"}
                </Text>
                <ChevronDown size={18} color={theme.colors.subtext} />
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <Modal
                  visible={showCategoryDropdown}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowCategoryDropdown(false)}
                >
                  <TouchableOpacity 
                    style={styles.dropdownBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                  >
                    <View style={styles.dropdownContainer}>
                      <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownTitle}>Välj kategori</Text>
                        <TouchableOpacity
                          onPress={() => setShowCategoryDropdown(false)}
                        >
                          <X size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                      </View>
                      <ScrollView 
                        style={styles.dropdown}
                        contentContainerStyle={styles.dropdownContentContainer} 
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        persistentScrollbar={true}
                        scrollEnabled={true}
                        alwaysBounceVertical={true}
                      >
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.dropdownItem, 
                              category === cat && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text 
                              style={[
                                styles.dropdownItemText,
                                category === cat && styles.dropdownItemTextSelected
                              ]}
                            >
                              {cat}
                            </Text>
                            {category === cat && (
                              <View style={styles.selectedMark}>
                                <Text style={styles.selectedMarkText}>✓</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <TouchableOpacity
                        style={styles.addNewCategoryItem}
                        onPress={() => {
                          setShowNewCategoryModal(true);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <View style={styles.addNewCategoryRow}>
                          <Plus size={16} color={theme.colors.gold} />
                          <Text style={styles.addNewCategoryText}>Lägg till ny kategori</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ingredienser (separerade med komma)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="t.ex. ris, lax, avokado"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Allergener (separerade med komma)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={allergens}
                onChangeText={setAllergens}
                placeholder="t.ex. gluten, skaldjur, soja"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Taggar (separerade med komma)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={tags}
                onChangeText={setTags}
                placeholder="t.ex. vegetarisk, vegansk, glutenfri"
                placeholderTextColor={theme.colors.subtext}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tillagningstid</Text>
              <TextInput
                style={styles.formInput}
                value={preparation_time}
                onChangeText={setPreparation_time}
                placeholder="t.ex. 15-20 min"
                placeholderTextColor={theme.colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Styrkenivå (0-5)</Text>
              <TextInput
                style={styles.formInput}
                value={spicy_level.toString()}
                onChangeText={(text) => setSpicy_level(parseInt(text) || 0)}
                placeholder="0"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Näringsinformation</Text>
              <View style={styles.nutritionInputRow}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Kalorier</Text>
                  <TextInput
                    style={styles.formInput}
                    value={calories.toString()}
                    onChangeText={(text) => setCalories(parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={protein.toString()}
                    onChangeText={(text) => setProtein(parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
              </View>
              <View style={styles.nutritionInputRow}>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Kolhydrater (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={carbs.toString()}
                    onChangeText={(text) => setCarbs(parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
                <View style={styles.nutritionInput}>
                  <Text style={styles.nutritionLabel}>Fett (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={fat.toString()}
                    onChangeText={(text) => setFat(parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Spara</Text>
              )}
            </TouchableOpacity>
          </View>

          <ImagePickerModal
            visible={showImagePicker}
            onClose={() => setShowImagePicker(false)}
            onImageSelect={handleImageSelected}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Modal för att lägga till ny kategori - återanvänd från AddMenuItemModal */}
      <Modal
        visible={showNewCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNewCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lägg till ny kategori</Text>
              <TouchableOpacity onPress={() => setShowNewCategoryModal(false)}>
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.smallModalContent}>
              <Text style={styles.formLabel}>Kategorinamn</Text>
              <TextInput
                style={styles.formInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Ange namn på ny kategori"
                placeholderTextColor={theme.colors.subtext}
                autoFocus
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNewCategoryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddNewCategory}
              >
                <Text style={styles.submitButtonText}>Lägg till</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Uppdatera DeleteButton-komponenten med röd ikon utan bakgrundsfärg
const EditUserModal = ({ 
  visible, 
  user, 
  onClose, 
  onSave 
}: { 
  visible: boolean; 
  user: any | null; 
  onClose: () => void; 
  onSave: (user: any) => Promise<void>; 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'user');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!email.trim()) {
      Alert.alert("Fel", "E-post krävs");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await onSave({
        ...user,
        name,
        email,
        phone,
        role
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert("Fel", "Kunde inte spara användaren");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redigera användare</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Namn</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Användarens namn"
                placeholderTextColor={theme.colors.subtext || '#666'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>E-post</Text>
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={setEmail}
                placeholder="E-postadress"
                placeholderTextColor={theme.colors.subtext || '#666'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Telefon</Text>
              <TextInput
                style={styles.formInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefonnummer"
                placeholderTextColor={theme.colors.subtext || '#666'}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Roll</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'user' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('user')}
                >
                  <Text 
                    style={[
                      styles.roleOptionText,
                      role === 'user' && styles.roleOptionTextSelected
                    ]}
                  >
                    Användare
                  </Text>
                  {role === 'user' && (
                    <CheckCircle size={16} color={theme.colors.gold} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'admin' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('admin')}
                >
                  <Text 
                    style={[
                      styles.roleOptionText,
                      role === 'admin' && styles.roleOptionTextSelected
                    ]}
                  >
                    Admin
                  </Text>
                  {role === 'admin' && (
                    <CheckCircle size={16} color={theme.colors.gold} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Spara</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const DeleteButton = ({ itemId, onSuccess }: { itemId: string, onSuccess: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      console.log("TEST-RADERA börjar direkt för ID:", itemId);
      setIsDeleting(true);
      
      // Direkt radering utan bekräftelse
      console.log(`[TEST_DELETE] Direktradering utan bekräftelse för ID: ${itemId}`);
      
      // Använd Supabase direkt
      const { data, error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      console.log(`[TEST_DELETE] Resultat:`, { data, error });
      
      if (error) {
        console.error(`[TEST_DELETE] Fel vid radering:`, error);
        throw new Error(`Kunde inte radera: ${error.message}`);
      }
      
      console.log(`[TEST_DELETE] Framgångsrikt raderad!`);
      Alert.alert(
        "Borttaget!",
        "Menyobjektet har raderats",
        [{ text: "OK", onPress: onSuccess }]
      );
    } catch (error: any) {
      console.error("[TEST_DELETE] Fel:", error);
      Alert.alert("Fel", `Kunde inte radera: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.actionButton,
        { marginLeft: 4 }
      ]}
      onPress={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <ActivityIndicator size="small" color="#ff3b30" />
      ) : (
        <Trash size={18} color="#ff3b30" />
      )}
    </TouchableOpacity>
  );
};

export default function AdminScreen() {
  const { isAdmin, isLoggedIn } = useUserStore();
  const { settings: restaurantSettings, fetchSettings, updateSettings } = useRestaurantStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<ExtendedMenuItem[]>([]); // Använder ExtendedMenuItem för att inkludera isPopular
  const [searchQuery, setSearchQuery] = useState('');
  const { items, loadMenu, isLoading, addMenuItem, deleteMenuItem, updateMenuItem } = useMenuStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [filteredItems, setFilteredItems] = useState<ExtendedMenuItem[]>([]);
  
  // Notifikationshantering - endast push notiser
  const { sendPromoNotification } = useNotificationStore();
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info' | 'promo'>('info');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // Avancerade notifikationsinställningar
  const [schedulingType, setSchedulingType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showSchedulingDropdown, setShowSchedulingDropdown] = useState(false);
  const [enableSound, setEnableSound] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  
  // Notification tabs och admin-inställningar
  const [notificationActiveTab, setNotificationActiveTab] = useState('send');
  const [adminNotificationSettings, setAdminNotificationSettings] = useState([
    {
      id: 'new_order',
      title: 'Nya beställningar',
      description: 'Få notifikationer när kunder lägger nya beställningar',
      icon: 'ShoppingBag',
      enabled: true,
      category: 'orders'
    },
    {
      id: 'order_cancelled',
      title: 'Avbrutna beställningar',
      description: 'Få notifikationer när beställningar avbryts',
      icon: 'XCircle',
      enabled: true,
      category: 'orders'
    },
    {
      id: 'new_booking',
      title: 'Nya bordsbokningar',
      description: 'Få notifikationer när kunder bokar bord',
      icon: 'Calendar',
      enabled: true,
      category: 'bookings'
    },
    {
      id: 'booking_cancelled',
      title: 'Avbrutna bokningar',
      description: 'Få notifikationer när bordsbokningar avbryts',
      icon: 'XCircle',
      enabled: false,
      category: 'bookings'
    },
    {
      id: 'new_user',
      title: 'Nya användare',
      description: 'Få notifikationer när nya kunder registrerar sig',
      icon: 'Users',
      enabled: false,
      category: 'users'
    },
    {
      id: 'system_alert',
      title: 'Systemvarningar',
      description: 'Få notifikationer om viktiga systemhändelser',
      icon: 'AlertTriangle',
      enabled: true,
      category: 'system'
    }
  ]);

  // Bokningshantering
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Användarhantering
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Orderhantering
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  // Inställningar
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(restaurantSettings);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      Alert.alert(
        "Åtkomst nekad",
        "Du har inte behörighet att se denna sida",
        [
          { text: "OK", onPress: () => router.replace('/') }
        ]
      );
    } else {
      // Load menu items
      fetchMenuItems();
      // Load bookings
      fetchBookings();
      // Load users
      fetchUsers();
              // Load orders
        fetchOrders();
        // Load restaurant settings
        loadRestaurantSettings();
      }
    }, [isLoggedIn, isAdmin]);

    // Update local settings when restaurant settings change
    useEffect(() => {
      setLocalSettings(restaurantSettings);
    }, [restaurantSettings]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      console.log("Hämtar menyobjekt...");
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Fel vid hämtning av menyobjekt:", error);
        Alert.alert("Fel", `Kunde inte hämta menyobjekt: ${error.message}`);
        return;
      }
      
      console.log(`Hämtade ${data?.length || 0} menyobjekt`);
      setMenuItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      console.error("Oväntat fel vid hämtning:", error);
      Alert.alert("Fel", "Ett oväntat fel inträffade vid hämtning av menyn");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      console.log("Hämtar bokningar...");
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Fel vid hämtning av bokningar:", error);
        Alert.alert("Fel", `Kunde inte hämta bokningar: ${error.message}`);
        return;
      }
      
      console.log(`Hämtade ${data?.length || 0} bokningar`);
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error: any) {
      console.error("Oväntat fel vid hämtning av bokningar:", error);
      Alert.alert("Fel", "Ett oväntat fel inträffade vid hämtning av bokningar");
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log("Hämtar användare...");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Fel vid hämtning av användare:", error);
        Alert.alert("Fel", `Kunde inte hämta användare: ${error.message}`);
        return;
      }
      
      console.log(`Hämtade ${data?.length || 0} användare`);
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      console.error("Oväntat fel vid hämtning av användare:", error);
      Alert.alert("Fel", "Ett oväntat fel inträffade vid hämtning av användare");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log("Hämtar ordrar...");
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (ordersData) {
        const ordersWithItems = [];
        
        for (const order of ordersData) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          
          if (itemsError) throw itemsError;
          
          ordersWithItems.push({
            ...order,
            items: itemsData || [],
          });
        }
        
        setOrders(ordersWithItems);
        setFilteredOrders(ordersWithItems);
      }
    } catch (error: any) {
      console.error("Fel vid hämtning av ordrar:", error);
      Alert.alert("Fel", "Ett oväntat fel inträffade vid hämtning av ordrar");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAddMenuItem = async (newItem: Omit<MenuItem, "id">) => {
    try {
      setLoading(true);
      console.log('Lägger till nytt menyobjekt:', newItem.name);
      
      // Omvandla till korrekt format för databasen
      const itemToInsert = {
        ...newItem,
        preparation_time: newItem.preparation_time || "10-15 min",
        spicy_level: newItem.spicy_level || 0,
        nutritional_info: newItem.nutritional_info || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      };

      const { data, error } = await supabase
        .from('menu_items')
        .insert(itemToInsert)
        .select()
        .single();

      if (error) {
        console.error('Fel vid tillägg av menyobjekt:', error);
        Alert.alert('Fel', `Kunde inte lägga till menyobjektet: ${error.message}`);
        return null;
      }

      console.log('Menyobjekt tillagt med ID:', data.id);
      Alert.alert('Klart', 'Menyobjektet har lagts till');
      
      // Uppdatera menyn i gränssnittet
      await fetchMenuItems();
      await loadMenu(); // Uppdatera även menu-store för att hålla allt synkat
      
      return data;
    } catch (error: any) {
      console.error('Oväntat fel vid tillägg av menyobjekt:', error);
      Alert.alert('Fel', `Ett oväntat fel uppstod: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (id: string) => {
    try {
      // Hitta det valda menyobjektet
      const item = menuItems.find(item => item.id === id);
      
      if (!item) {
        console.error(`[AdminScreen] Menu item with ID ${id} not found`);
        Alert.alert('Fel', 'Kunde inte hitta menyobjektet');
        return;
      }
      
      // Sätt valt objekt och öppna redigeringsmodalen
      setSelectedMenuItem(item);
      setShowEditModal(true);
    } catch (error) {
      console.error('[AdminScreen] Error preparing edit:', error);
      Alert.alert('Fel', 'Kunde inte öppna redigeringsläget');
    }
  };
  
  const handleUpdateItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      setLoading(true);
      console.log(`[AdminScreen] Updating menu item with ID: ${id}`);
      console.log('[AdminScreen] Updates:', JSON.stringify(updates, null, 2));
      
      // Anropa store-funktionen för att uppdatera
      const updatedItem = await updateMenuItem(id, updates);
      
      if (updatedItem) {
        console.log(`[AdminScreen] Successfully updated menu item with ID: ${id}`);
        // Uppdatera den lokala listan med menyposter
        await fetchMenuItems();
        Alert.alert("Uppdaterad", "Menyobjektet har uppdaterats");
        setShowEditModal(false);
      } else {
        console.error(`[AdminScreen] Failed to update menu item with ID: ${id}`);
        throw new Error('Kunde inte uppdatera menyobjektet');
      }
    } catch (error: any) {
      console.error('[AdminScreen] Error updating menu item:', error);
      
      // Visa ett mer detaljerat felmeddelande
      let errorMessage = 'Kunde inte uppdatera menyobjektet';
      
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      // Kontrollera om det är ett Supabase-fel
      if (error?.error?.message) {
        errorMessage += ` (${error.error.message})`;
      }
      
      Alert.alert('Fel', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredItems(menuItems);
      return;
    }
    const lowercasedQuery = text.toLowerCase();
    const filtered = menuItems.filter(item => 
      item.name?.toLowerCase().includes(lowercasedQuery) || 
      item.description?.toLowerCase().includes(lowercasedQuery) ||
      item.category?.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredItems(filtered);
  };

  const handleBookingSearch = (text: string) => {
    setBookingSearchQuery(text);
    if (!text.trim()) {
      setFilteredBookings(bookings);
      return;
    }
    const lowercasedQuery = text.toLowerCase();
    const filtered = bookings.filter(booking => 
      booking.name?.toLowerCase().includes(lowercasedQuery) || 
      booking.email?.toLowerCase().includes(lowercasedQuery) ||
      booking.phone?.toLowerCase().includes(lowercasedQuery) ||
      booking.status?.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) {
        console.error("Fel vid uppdatering av bokningsstatus:", error);
        Alert.alert("Fel", `Kunde inte uppdatera bokningsstatus: ${error.message}`);
        return;
      }

      Alert.alert("Uppdaterad", "Bokningsstatus har uppdaterats");
      await fetchBookings(); // Uppdatera listan
    } catch (error: any) {
      console.error("Oväntat fel vid uppdatering av bokningsstatus:", error);
      Alert.alert("Fel", "Ett oväntat fel inträffade vid uppdatering av bokningsstatus");
    }
  };

  const handleUserSearch = (text: string) => {
    setUserSearchQuery(text);
    if (!text.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lowercasedQuery = text.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(lowercasedQuery) || 
      user.email?.toLowerCase().includes(lowercasedQuery) ||
      user.role?.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredUsers(filtered);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditUserModal(true);
    }
  };

  const handleSaveUser = async (updatedUser: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role
        })
        .eq('id', updatedUser.id);

      if (error) throw error;

      Alert.alert('Uppdaterad', 'Användaren har uppdaterats');
      await fetchUsers();
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Fel vid uppdatering av användare:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera användaren');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('user_id, name')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Skicka push-notifikation till användaren
      if (orderData?.user_id) {
        try {
          const { PushNotificationService } = await import('@/utils/PushNotificationService');
          
          if (newStatus === 'completed') {
            await PushNotificationService.notifyUserOrderCompleted(
              orderData.user_id, 
              orderId, 
              orderData.name || 'Kund'
            );
          } else if (newStatus === 'cancelled') {
            await PushNotificationService.notifyUserOrderCancelled(
              orderData.user_id, 
              orderId, 
              orderData.name || 'Kund'
            );
          }
        } catch (notificationError) {
          console.error('❌ Fel vid skicka push-notifikation till användare:', notificationError);
        }
      }
      
      Alert.alert('Uppdaterad', 'Orderstatus har uppdaterats');
      await fetchOrders();
    } catch (error: any) {
      console.error('Fel vid uppdatering av orderstatus:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera orderstatus');
    }
  };

  const handleOrderFilter = (status: string | null) => {
    setOrderFilterStatus(status);
    const filtered = status 
      ? orders.filter(order => order.status === status)
      : orders;
    setFilteredOrders(filtered);
  };

  // Notifikationshantering
  const handleSendNotification = () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Fel', 'Både titel och meddelande måste fyllas i');
      return;
    }

    // Validera schemaläggning om det inte är omedelbart
    if (schedulingType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      Alert.alert('Fel', 'Datum och tid måste anges för schemalagda notifikationer');
      return;
    }

    // Skicka in-app notifikation baserat på schemaläggning
    if (schedulingType === 'immediate') {
      sendImmediateNotification();
    } else if (schedulingType === 'scheduled') {
      scheduleNotificationForLater();
    }
  };

  const sendImmediateNotification = async () => {
    // Kontrollera och begär notifikationsbehörigheter
    const hasPermission = await NotificationManager.requestPermissions();
    
    if (!hasPermission) {
      Alert.alert(
        'Behörigheter krävs', 
        'För att skicka notifikationer behöver appen behörighet att visa notifikationer. Aktivera detta i inställningar.',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Öppna inställningar', onPress: () => console.log('Öppna inställningar') }
        ]
      );
      return;
    }

    // Skicka push notifikation som visas på hemskärmen
    const notificationData = {
      title: notificationTitle,
      body: notificationMessage,
      data: { 
        type: notificationType === 'success' || notificationType === 'error' ? 'order' : notificationType,
        targetAudience: 'all',
        priority: 'normal',
        sound: enableSound
      },
    };

    // Skicka push-notifikation som visas på hemskärmen
    const notificationId = await NotificationManager.sendLocalNotification(notificationData);
    
    if (notificationId) {
      console.log('✅ Push-notifikation skickad med ID:', notificationId);
      
      // Endast logga - inga in-app notiser
      console.log(`Push-notifikation av typ ${notificationType} skickad: ${notificationTitle}`);

      resetNotificationForm();
      console.log('✅ Push-notifikationen med Moi-logotyp har skickats och kommer att visas på hemskärmen');
    } else {
      console.error('❌ Kunde inte skicka notifikationen. Kontrollera konsolen för mer information.');
    }
  };

  const scheduleNotificationForLater = () => {
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (scheduledDateTime <= new Date()) {
      Alert.alert('Fel', 'Schemalagd tid måste vara i framtiden');
      return;
    }

    // Här skulle man integrera med en backend för att schemalägga riktiga push-notifikationer
    console.log('Schemaläggning av notifikation:', {
      title: notificationTitle,
      message: notificationMessage,
      scheduledFor: scheduledDateTime,
      audience: 'all',
      type: notificationType
    });

    resetNotificationForm();
    console.log(`📅 Notifikationen kommer att skickas ${scheduledDateTime.toLocaleString('sv-SE')}`);
  };

  const resetNotificationForm = () => {
    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationType('info');
    setSchedulingType('immediate');
    setScheduledDate('');
    setScheduledTime('');
    setEnableSound(true);
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'success': return 'Framgång';
      case 'error': return 'Fel';
      case 'info': return 'Information';
      case 'promo': return 'Erbjudande';
      default: return 'Information';
    }
  };

  const getSchedulingLabel = (type: 'immediate' | 'scheduled') => {
    switch (type) {
      case 'immediate': return 'Skicka nu';
      case 'scheduled': return 'Schemalägg';
      default: return 'Skicka nu';
    }
  };

  const getPriorityLabel = (priority: 'low' | 'normal' | 'high') => {
    switch (priority) {
      case 'low': return 'Låg prioritet';
      case 'normal': return 'Normal prioritet';
      case 'high': return 'Hög prioritet';
      default: return 'Normal prioritet';
    }
  };

  const applyTemplate = (title: string, message: string, type: 'success' | 'error' | 'info' | 'promo') => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationType(type);
  };

  // Admin notification settings funktioner
  const toggleAdminNotificationSetting = (settingId: string) => {
    setAdminNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const saveAdminNotificationSettings = async () => {
    try {
      // Här skulle man spara inställningarna till databasen
      Alert.alert('Sparat', 'Admin-notifikationsinställningarna har sparats.');
    } catch (error) {
      console.error('Fel vid sparande av admin-notifikationsinställningar:', error);
      Alert.alert('Fel', 'Kunde inte spara inställningarna.');
    }
  };

  const getCategorySettings = (category: string) => {
    return adminNotificationSettings.filter(setting => setting.category === category);
  };

  const getIconForSetting = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return ShoppingBag;
      case 'XCircle': return X;
      case 'Calendar': return Calendar;
      case 'Users': return Users;
      case 'AlertTriangle': return AlertTriangle;
      default: return Bell;
    }
  };

  // Settings funktioner
  const loadRestaurantSettings = async () => {
    try {
      setSettingsLoading(true);
      await fetchSettings();
      setLocalSettings(restaurantSettings);
    } catch (error) {
      console.error('Fel vid hämtning av inställningar:', error);
      Alert.alert('Fel', 'Kunde inte hämta restaurangens inställningar.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveRestaurantSettings = async () => {
    try {
      setSettingsSaving(true);
      const success = await updateSettings(localSettings);
      
      if (success) {
        Alert.alert('Sparat', 'Inställningarna har sparats.');
      } else {
        Alert.alert('Fel', 'Kunde inte spara inställningarna. Försök igen.');
      }
    } catch (error) {
      console.error('Fel vid sparande av inställningar:', error);
      Alert.alert('Fel', 'Kunde inte spara inställningarna.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const testPushNotifications = async () => {
    try {
      console.log('🧪 Testar push-notifikationer...');
      
      // Kontrollera admin push tokens
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, name, email, push_token')
        .eq('role', 'admin');

      if (error) {
        console.error('❌ Fel vid hämtning av admins:', error);
        Alert.alert('Fel', 'Kunde inte hämta admin-data');
        return;
      }

      console.log('👥 Hittade admins:', admins);
      
      const adminsWithTokens = admins?.filter(admin => admin.push_token) || [];
      const adminsWithoutTokens = admins?.filter(admin => !admin.push_token) || [];

      Alert.alert(
        'Push Token Status',
        `Totalt ${admins?.length || 0} admins\n` +
        `${adminsWithTokens.length} har push tokens\n` +
        `${adminsWithoutTokens.length} saknar push tokens\n\n` +
        `Admins med tokens:\n${adminsWithTokens.map(a => `• ${a.name || a.email}`).join('\n')}\n\n` +
        `Admins utan tokens:\n${adminsWithoutTokens.map(a => `• ${a.name || a.email}`).join('\n')}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Fel vid test av push-notifikationer:', error);
      Alert.alert('Fel', 'Kunde inte testa push-notifikationer');
    }
  };

  const renderAdminHome = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Administratörspanel</Text>
        <Text style={styles.subHeader}>Välj vad du vill hantera</Text>
        
        <View style={styles.navContainer}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setActiveTab('menu')}
          >
            <Text style={styles.navButtonText}>Hantera Meny</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.gold, flexDirection: 'row', alignItems: 'center' }]}
            onPress={testPushNotifications}
          >
            <Bell size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.navButtonText}>Testa Push-Notiser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
          <Text style={styles.loadingText}>Laddar...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'menu':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={theme.colors.subtext} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök i menyn..."
                  placeholderTextColor={theme.colors.subtext}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color={theme.colors.subtext} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => Alert.alert('Info', 'Filterfunktionen är under utveckling')}
              >
                <Filter size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchMenuItems}
                disabled={loading}
              >
                <Text style={styles.refreshButtonText}>Uppdatera meny</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 2 }]}>Namn</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Pris</Text>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>Kategori</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Åtgärder</Text>
            </View>
            
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Inga menyobjekt hittades</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={fetchMenuItems}
                >
                  <Text style={styles.emptyButtonText}>Uppdatera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                {filteredItems.map((item) => (
                  <View key={item.id} style={styles.menuItemRow}>
                    <View style={[styles.menuItemCell, { flex: 2 }]}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      {item.isPopular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>Populär</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.menuItemCell, styles.menuItemText, { flex: 1 }]}>{item.price} kr</Text>
                    <Text style={[styles.menuItemCell, styles.menuItemText, { flex: 1.5 }]}>{item.category}</Text>
                    <View style={[styles.menuItemCell, { flex: 1, flexDirection: 'row' }]}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditItem(item.id)}
                      >
                        <Edit size={18} color={theme.colors.gold} />
                      </TouchableOpacity>
                      <DeleteButton 
                        itemId={item.id} 
                        onSuccess={() => {
                          // Ta bort från lokala listor
                          setMenuItems(prev => prev.filter(i => i.id !== item.id));
                          setFilteredItems(prev => prev.filter(i => i.id !== item.id));
                          // Ladda om menyn från Supabase
                          fetchMenuItems();
                        }}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Lägg till ny</Text>
            </TouchableOpacity>

            <AddMenuItemModal
              visible={showAddModal}
              onClose={() => setShowAddModal(false)}
              onAdd={handleAddMenuItem}
            />
            
            <EditMenuItemModal
              visible={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setSelectedMenuItem(null);
              }}
              onSave={handleUpdateItem}
              menuItem={selectedMenuItem}
            />
          </View>
        );
      case 'users':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={theme.colors.subtext} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök användare..."
                  placeholderTextColor={theme.colors.subtext}
                  value={userSearchQuery}
                  onChangeText={handleUserSearch}
                />
                {userSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setUserSearchQuery('')}>
                    <X size={16} color={theme.colors.subtext} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchUsers}
                disabled={usersLoading}
              >
                <Text style={styles.refreshButtonText}>Uppdatera</Text>
              </TouchableOpacity>
            </View>
            
            {usersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.gold} />
                <Text style={styles.loadingText}>Laddar användare...</Text>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Inga användare hittades</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={fetchUsers}
                >
                  <Text style={styles.emptyButtonText}>Uppdatera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                {filteredUsers.map((user) => (
                  <View key={user.id} style={styles.userCard}>
                    <View style={styles.userHeader}>
                      <View style={styles.userInfo}>
                        <View style={[
                          styles.userAvatar,
                          { backgroundColor: user.role === 'admin' ? '#FF6B6B' : '#4ECDC4' }
                        ]}>
                          <User size={20} color="#fff" />
                        </View>
                        <View style={styles.userDetails}>
                          <Text style={styles.userName}>{user.name || 'Namnlös användare'}</Text>
                          <Text style={styles.userEmail}>{user.email}</Text>
                          {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
                        </View>
                      </View>
                      <View style={[styles.roleBadge, { 
                        backgroundColor: user.role === 'admin' ? '#FF6B6B' : '#4ECDC4' 
                      }]}>
                        <Text style={styles.roleText}>
                          {user.role === 'admin' ? 'Admin' : 'Användare'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.userActions}>
                      <TouchableOpacity 
                        style={styles.editUserButton}
                        onPress={() => handleEditUser(user.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.editButtonContent}>
                          <View style={styles.editIconContainer}>
                            <Edit size={16} color="#fff" />
                          </View>
                          <Text style={styles.editButtonText}>Redigera</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.userTimestamp}>
                      Registrerad: {new Date(user.created_at).toLocaleDateString('sv-SE')}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            
            <EditUserModal
              visible={showEditUserModal}
              user={selectedUser}
              onClose={() => {
                setShowEditUserModal(false);
                setSelectedUser(null);
              }}
              onSave={handleSaveUser}
            />
          </View>
        );
      case 'orders':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.orderFilters}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchOrders}
                disabled={ordersLoading}
              >
                <Text style={styles.refreshButtonText}>Uppdatera ordrar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statusFilterContainer}>
              {[
                { key: null, label: 'Alla' },
                { key: 'pending', label: 'Väntar' },
                { key: 'processing', label: 'Behandlas' },
                { key: 'completed', label: 'Slutförd' },
                { key: 'cancelled', label: 'Avbruten' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key || 'all'}
                  style={[
                    styles.statusFilterButton,
                    orderFilterStatus === filter.key && styles.statusFilterButtonActive
                  ]}
                  onPress={() => handleOrderFilter(filter.key)}
                >
                  <Text style={[
                    styles.statusFilterText,
                    orderFilterStatus === filter.key && styles.statusFilterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {ordersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.gold} />
                <Text style={styles.loadingText}>Laddar ordrar...</Text>
              </View>
            ) : filteredOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Inga ordrar hittades</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={fetchOrders}
                >
                  <Text style={styles.emptyButtonText}>Uppdatera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                {filteredOrders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor: 
                            order.status === 'completed' ? '#4ECDC4' :
                            order.status === 'pending' ? '#FFE66D' :
                            order.status === 'processing' ? '#4FC3F7' : '#FF6B6B'
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: order.status === 'pending' ? '#111' : '#fff' }
                        ]}>
                          {order.status === 'completed' ? 'Slutförd' : 
                           order.status === 'pending' ? 'Väntar' : 
                           order.status === 'processing' ? 'Behandlas' : 'Avbruten'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderCustomer}>{order.name || 'Namnlös kund'}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('sv-SE')} {' '}
                        {new Date(order.created_at).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      <Text style={styles.orderPrice}>{order.total_price} kr</Text>
                      {order.delivery_address && (
                        <Text style={styles.orderAddress}>{order.delivery_address}</Text>
                      )}
                      {order.phone && (
                        <Text style={styles.orderPhone}>{order.phone}</Text>
                      )}
                    </View>
                    
                    <View style={styles.orderItems}>
                      <Text style={styles.orderItemsTitle}>Beställda rätter:</Text>
                      {order.items?.map((item, index) => (
                        <View key={index} style={styles.orderItemRow}>
                          <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                          <Text style={styles.orderItemText}>{item.name}</Text>
                          <Text style={styles.orderItemPrice}>{item.price * item.quantity} kr</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.orderActions}>
                      {order.status === 'pending' && (
                        <>
                          <TouchableOpacity
                            style={[styles.orderActionButton, { backgroundColor: '#4FC3F7' }]}
                            onPress={() => updateOrderStatus(order.id, 'processing')}
                          >
                            <Clock size={16} color="#fff" />
                            <Text style={styles.orderActionButtonText}>Behandla</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.orderActionButton, { backgroundColor: '#4ECDC4' }]}
                            onPress={() => updateOrderStatus(order.id, 'completed')}
                          >
                            <Check size={16} color="#fff" />
                            <Text style={styles.orderActionButtonText}>Slutför</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.orderActionButton, { backgroundColor: '#FF6B6B' }]}
                            onPress={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            <X size={16} color="#fff" />
                            <Text style={styles.orderActionButtonText}>Avbryt</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {order.status === 'processing' && (
                        <>
                          <TouchableOpacity
                            style={[styles.orderActionButton, { backgroundColor: '#4ECDC4' }]}
                            onPress={() => updateOrderStatus(order.id, 'completed')}
                          >
                            <Check size={16} color="#fff" />
                            <Text style={styles.orderActionButtonText}>Slutför</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.orderActionButton, { backgroundColor: '#FF6B6B' }]}
                            onPress={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            <X size={16} color="#fff" />
                            <Text style={styles.orderActionButtonText}>Avbryt</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        );
      case 'settings':
        return (
          <View style={styles.contentContainer}>
            {settingsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.gold} />
                <Text style={styles.loadingText}>Laddar inställningar...</Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Restauranginformation</Text>
                  
                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>Restaurangnamn</Text>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.name || ''}
                      onChangeText={(text) => handleSettingsChange('name', text)}
                      placeholder="Restaurangnamn"
                      placeholderTextColor={theme.colors.subtext}
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>Beskrivning</Text>
                    <TextInput
                      style={[styles.settingsInput, styles.settingsTextArea]}
                      value={localSettings?.description || ''}
                      onChangeText={(text) => handleSettingsChange('description', text)}
                      placeholder="Beskrivning av restaurangen"
                      placeholderTextColor={theme.colors.subtext}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <View style={styles.settingsLabelWithIcon}>
                      <Clock size={20} color={theme.colors.text} />
                      <Text style={styles.settingsLabel}>Öppettider</Text>
                    </View>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.open_hours || ''}
                      onChangeText={(text) => handleSettingsChange('open_hours', text)}
                      placeholder="Mån-Fre: 11:00-22:00, Lör-Sön: 12:00-23:00"
                      placeholderTextColor={theme.colors.subtext}
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <View style={styles.settingsLabelWithIcon}>
                      <MapPin size={20} color={theme.colors.text} />
                      <Text style={styles.settingsLabel}>Adress</Text>
                    </View>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.address || ''}
                      onChangeText={(text) => handleSettingsChange('address', text)}
                      placeholder="Gatuadress, Stad"
                      placeholderTextColor={theme.colors.subtext}
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <View style={styles.settingsLabelWithIcon}>
                      <Globe size={20} color={theme.colors.text} />
                      <Text style={styles.settingsLabel}>Webbplats</Text>
                    </View>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.website || ''}
                      onChangeText={(text) => handleSettingsChange('website', text)}
                      placeholder="https://www.restaurang.se"
                      placeholderTextColor={theme.colors.subtext}
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <View style={styles.settingsLabelWithIcon}>
                      <Mail size={20} color={theme.colors.text} />
                      <Text style={styles.settingsLabel}>E-post</Text>
                    </View>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.contact_email || ''}
                      onChangeText={(text) => handleSettingsChange('contact_email', text)}
                      placeholder="info@restaurang.se"
                      placeholderTextColor={theme.colors.subtext}
                      keyboardType="email-address"
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <View style={styles.settingsLabelWithIcon}>
                      <Phone size={20} color={theme.colors.text} />
                      <Text style={styles.settingsLabel}>Telefon</Text>
                    </View>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.contact_phone || ''}
                      onChangeText={(text) => handleSettingsChange('contact_phone', text)}
                      placeholder="08-123 456 78"
                      placeholderTextColor={theme.colors.subtext}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Leveransinställningar</Text>
                  
                  <View style={styles.settingsToggleGroup}>
                    <Text style={styles.settingsLabel}>Aktivera leverans</Text>
                    <TouchableOpacity
                      style={[
                        styles.adminNotificationToggle,
                        localSettings?.delivery_enabled && styles.adminNotificationToggleActive
                      ]}
                      onPress={() => handleSettingsChange('delivery_enabled', !localSettings?.delivery_enabled)}
                    >
                      <View style={[
                        styles.adminNotificationToggleThumb,
                        localSettings?.delivery_enabled && styles.adminNotificationToggleThumbActive
                      ]} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>Minsta ordervärde (kr)</Text>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.min_order_value?.toString() || '0'}
                      onChangeText={(text) => handleSettingsChange('min_order_value', parseInt(text) || 0)}
                      placeholder="0"
                      placeholderTextColor={theme.colors.subtext}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>Leveransavgift (kr)</Text>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.delivery_fee?.toString() || '0'}
                      onChangeText={(text) => handleSettingsChange('delivery_fee', parseInt(text) || 0)}
                      placeholder="0"
                      placeholderTextColor={theme.colors.subtext}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.settingsInputGroup}>
                    <Text style={styles.settingsLabel}>Gräns för gratis leverans (kr)</Text>
                    <TextInput
                      style={styles.settingsInput}
                      value={localSettings?.free_delivery_threshold?.toString() || '0'}
                      onChangeText={(text) => handleSettingsChange('free_delivery_threshold', parseInt(text) || 0)}
                      placeholder="0"
                      placeholderTextColor={theme.colors.subtext}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.saveSettingsButton, settingsSaving && styles.disabledButton]}
                  onPress={saveRestaurantSettings}
                  disabled={settingsSaving}
                >
                  {settingsSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Save size={20} color="#fff" />
                  )}
                  <Text style={styles.saveSettingsButtonText}>
                    {settingsSaving ? 'Sparar...' : 'Spara inställningar'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.contentContainer}>
            {/* Notification Tabs */}
            <View style={styles.notificationTabContainer}>
              <TouchableOpacity 
                style={[
                  styles.notificationTab,
                  notificationActiveTab === 'send' && styles.notificationTabActive
                ]}
                onPress={() => setNotificationActiveTab('send')}
              >
                <Bell size={18} color={notificationActiveTab === 'send' ? theme.colors.gold : theme.colors.text} />
                <Text style={[
                  styles.notificationTabText,
                  notificationActiveTab === 'send' && styles.notificationTabTextActive
                ]}>
                  Skicka notiser
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.notificationTab,
                  notificationActiveTab === 'admin' && styles.notificationTabActive
                ]}
                onPress={() => setNotificationActiveTab('admin')}
              >
                <Settings size={18} color={notificationActiveTab === 'admin' ? theme.colors.gold : theme.colors.text} />
                <Text style={[
                  styles.notificationTabText,
                  notificationActiveTab === 'admin' && styles.notificationTabTextActive
                ]}>
                  Admin-inställningar
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.notificationForm} 
              showsVerticalScrollIndicator={false}
            >
              {notificationActiveTab === 'send' && (
                <>
                  {/* Notification Form Section */}
                  <View style={styles.notificationFormSection}>
                <View style={styles.notificationFormHeader}>
                  <Text style={styles.sectionTitle}>✉️ Skicka notifikation</Text>
                  <Text style={styles.sectionDescription}>
                    Skapa och skicka meddelanden med avancerade inställningar
                  </Text>
                </View>

                {/* Schemaläggningstyp */}
                <View style={styles.notificationInputGroup}>
                  <View style={styles.notificationInputLabelContainer}>
                    <Clock size={18} color={theme.colors.gold} />
                    <Text style={styles.notificationInputLabel}>Schemaläggning</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.notificationDropdownButton}
                    onPress={() => setShowSchedulingDropdown(!showSchedulingDropdown)}
                  >
                    <Text style={styles.notificationDropdownButtonText}>
                      {getSchedulingLabel(schedulingType)}
                    </Text>
                    <ChevronDown 
                      size={20} 
                      color={theme.colors.text} 
                      style={{ 
                        transform: [{ rotate: showSchedulingDropdown ? '180deg' : '0deg' }] 
                      }}
                    />
                  </TouchableOpacity>

                  {showSchedulingDropdown && (
                    <View style={styles.notificationDropdownMenu}>
                      {['immediate', 'scheduled'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.notificationDropdownItem,
                            schedulingType === type && styles.notificationDropdownItemActive
                          ]}
                          onPress={() => {
                            setSchedulingType(type as any);
                            setShowSchedulingDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.notificationDropdownItemText,
                            schedulingType === type && styles.notificationDropdownItemTextActive
                          ]}>
                            {getSchedulingLabel(type as any)}
                          </Text>
                          {schedulingType === type && (
                            <Check size={16} color={theme.colors.gold} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Schemaläggningsdetaljer */}
                {schedulingType === 'scheduled' && (
                  <View style={styles.notificationSchedulingDetails}>
                    <View style={styles.notificationSchedulingRow}>
                      <View style={styles.notificationSchedulingCol}>
                        <View style={styles.notificationInputLabelContainer}>
                          <Calendar size={18} color={theme.colors.gold} />
                          <Text style={styles.notificationInputLabel}>Datum</Text>
                        </View>
                        <TextInput
                          style={styles.notificationTextInput}
                          placeholder="ÅÅÅÅ-MM-DD"
                          placeholderTextColor={theme.colors.subtext}
                          value={scheduledDate}
                          onChangeText={setScheduledDate}
                        />
                      </View>
                      
                      <View style={styles.notificationSchedulingCol}>
                        <View style={styles.notificationInputLabelContainer}>
                          <Clock size={18} color={theme.colors.gold} />
                          <Text style={styles.notificationInputLabel}>Tid</Text>
                        </View>
                        <TextInput
                          style={styles.notificationTextInput}
                          placeholder="HH:MM"
                          placeholderTextColor={theme.colors.subtext}
                          value={scheduledTime}
                          onChangeText={setScheduledTime}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Notifikationstyp */}
                <View style={styles.notificationInputGroup}>
                  <View style={styles.notificationInputLabelContainer}>
                    <Bell size={18} color={theme.colors.gold} />
                    <Text style={styles.notificationInputLabel}>Typ av notifikation</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.notificationDropdownButton}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <Text style={styles.notificationDropdownButtonText}>
                      {getNotificationTypeLabel(notificationType)}
                    </Text>
                    <ChevronDown 
                      size={20} 
                      color={theme.colors.text}
                      style={{ 
                        transform: [{ rotate: showTypeDropdown ? '180deg' : '0deg' }] 
                      }}
                    />
                  </TouchableOpacity>

                  {showTypeDropdown && (
                    <View style={styles.notificationDropdownMenu}>
                      {['info', 'success', 'error', 'promo'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.notificationDropdownItem,
                            notificationType === type && styles.notificationDropdownItemActive
                          ]}
                          onPress={() => {
                            setNotificationType(type as any);
                            setShowTypeDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.notificationDropdownItemText,
                            notificationType === type && styles.notificationDropdownItemTextActive
                          ]}>
                            {getNotificationTypeLabel(type)}
                          </Text>
                          {notificationType === type && (
                            <Check size={16} color={theme.colors.gold} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Titel */}
                <View style={styles.notificationInputGroup}>
                  <View style={styles.notificationInputLabelContainer}>
                    <Edit size={18} color={theme.colors.gold} />
                    <Text style={styles.notificationInputLabel}>Titel</Text>
                  </View>
                  <TextInput
                    style={styles.notificationTextInput}
                    placeholder="Ange notifikationens titel..."
                    placeholderTextColor={theme.colors.subtext}
                    value={notificationTitle}
                    onChangeText={setNotificationTitle}
                    maxLength={50}
                  />
                  <View style={styles.notificationCharacterCountContainer}>
                    <Text style={[
                      styles.notificationCharacterCount,
                      notificationTitle.length > 40 && styles.notificationCharacterCountWarning
                    ]}>
                      {notificationTitle.length}/50
                    </Text>
                  </View>
                </View>

                {/* Meddelande */}
                <View style={styles.notificationInputGroup}>
                  <View style={styles.notificationInputLabelContainer}>
                    <Edit size={18} color={theme.colors.gold} />
                    <Text style={styles.notificationInputLabel}>Meddelande</Text>
                  </View>
                  <TextInput
                    style={[styles.notificationTextInput, styles.notificationTextAreaInput]}
                    placeholder="Skriv ditt meddelande här..."
                    placeholderTextColor={theme.colors.subtext}
                    value={notificationMessage}
                    onChangeText={setNotificationMessage}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                  />
                  <View style={styles.notificationCharacterCountContainer}>
                    <Text style={[
                      styles.notificationCharacterCount,
                      notificationMessage.length > 180 && styles.notificationCharacterCountWarning
                    ]}>
                      {notificationMessage.length}/200
                    </Text>
                  </View>
                </View>

                {/* Ljudinställningar */}
                <View style={styles.notificationSoundContainer}>
                  <TouchableOpacity
                    style={styles.notificationCheckboxContainer}
                    onPress={() => setEnableSound(!enableSound)}
                  >
                    <View style={[
                      styles.notificationCheckbox, 
                      enableSound && styles.notificationCheckboxChecked
                    ]}>
                      {enableSound && <Check size={14} color="#fff" />}
                    </View>
                    <Text style={styles.notificationCheckboxLabel}>Aktivera ljud för notifikation</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Förhandsvisning */}
              <View style={styles.notificationPreviewSection}>
                <TouchableOpacity
                  style={styles.notificationPreviewButton}
                  onPress={() => setShowPreview(!showPreview)}
                >
                  <Eye size={20} color={theme.colors.gold} />
                  <Text style={styles.notificationPreviewButtonText}>
                    {showPreview ? 'Dölj förhandsvisning' : 'Visa förhandsvisning'}
                  </Text>
                  <ChevronDown 
                    size={16} 
                    color={theme.colors.gold}
                    style={{ 
                      transform: [{ rotate: showPreview ? '180deg' : '0deg' }] 
                    }}
                  />
                </TouchableOpacity>

                {showPreview && (
                  <View style={styles.notificationPreviewContainer}>
                    <Text style={styles.notificationPreviewTitle}>📱 Förhandsvisning</Text>
                    <View style={[styles.notificationPreviewNotification, 
                      notificationType === 'success' && styles.notificationPreviewSuccess,
                      notificationType === 'error' && styles.notificationPreviewError,
                      notificationType === 'promo' && styles.notificationPreviewPromo,
                    ]}>
                      <View style={styles.notificationPreviewHeader}>
                        <View style={styles.notificationPreviewIcon}>
                          <Bell size={16} color="#fff" />
                        </View>
                        <Text style={styles.notificationPreviewNotificationTitle}>
                          {notificationTitle || 'Notifikationstitel'}
                        </Text>
                      </View>
                      <Text style={styles.notificationPreviewNotificationMessage}>
                        {notificationMessage || 'Ditt meddelande kommer att visas här...'}
                      </Text>
                      <View style={styles.notificationPreviewFooter}>
                        <Text style={styles.notificationPreviewDetails}>
                          {getSchedulingLabel(schedulingType)} • Alla användare
                        </Text>
                        <Text style={styles.notificationPreviewTime}>
                          {schedulingType === 'immediate' ? 'Nu' : `${scheduledDate} ${scheduledTime}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Skicka-knapp */}
              <TouchableOpacity
                style={[
                  styles.notificationSendButton,
                  (!notificationTitle.trim() || !notificationMessage.trim()) && styles.notificationSendButtonDisabled
                ]}
                onPress={handleSendNotification}
                disabled={!notificationTitle.trim() || !notificationMessage.trim()}
              >
                <View style={styles.notificationSendButtonContent}>
                  <Bell size={20} color="#fff" />
                  <Text style={styles.notificationSendButtonText}>
                    {schedulingType === 'immediate' ? 'Skicka notifikation' : 'Schemalägg notifikation'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Snabbmallar */}
              <View style={styles.notificationTemplatesSection}>
                <View style={styles.notificationTemplatesHeader}>
                  <Text style={styles.notificationTemplatesSectionTitle}>🚀 Snabbmallar</Text>
                  <Text style={styles.notificationTemplatesSectionDescription}>
                    Klicka på en mall för att fylla i formuläret automatiskt
                  </Text>
                </View>
                
                {/* Erbjudanden */}
                <View style={styles.notificationTemplateCategory}>
                  <Text style={styles.notificationTemplateCategoryTitle}>🎯 Erbjudanden & Kampanjer</Text>
                  <View style={styles.notificationTemplateGrid}>
                    <TouchableOpacity
                      style={[styles.notificationTemplateButton, styles.notificationTemplatePromo]}
                      onPress={() => applyTemplate('Specialerbjudande! 🍣', '20% rabatt på alla sushi-rullar idag! Begränsad tid.', 'promo')}
                    >
                      <Text style={styles.notificationTemplateButtonIcon}>🍣</Text>
                      <Text style={styles.notificationTemplateButtonText}>Sushi-erbjudande</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.notificationTemplateButton, styles.notificationTemplatePromo]}
                      onPress={() => applyTemplate('Happy Hour! 🥢', 'Köp 2 få 1 gratis på alla drycker mellan 15-17! Missa inte detta!', 'promo')}
                    >
                      <Text style={styles.notificationTemplateButtonIcon}>🥢</Text>
                      <Text style={styles.notificationTemplateButtonText}>Happy Hour</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.notificationTemplateButton, styles.notificationTemplatePromo]}
                      onPress={() => applyTemplate('Gratis leverans! 🚚', 'Beställ för minst 300kr och få gratis leverans hela veckan!', 'promo')}
                    >
                      <Text style={styles.notificationTemplateButtonIcon}>🚚</Text>
                      <Text style={styles.notificationTemplateButtonText}>Gratis leverans</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Information */}
                <Text style={styles.templateCategoryTitle}>ℹ️ Information</Text>
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Nya rätter tillgängliga! 🎉', 'Vi har uppdaterat vår meny med spännande nya alternativ.', 'info')}
                >
                  <Text style={styles.templateButtonText}>Ny meny</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Öppettidsändring 📅', 'Observera ändrade öppettider under helger.', 'info')}
                >
                  <Text style={styles.templateButtonText}>Öppettider</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Helgstängt 🏮', 'Vi är stängda under midsommar 21-23 juni. Välkomna tillbaka måndag!', 'info')}
                >
                  <Text style={styles.templateButtonText}>Helgstängt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Underhåll pågår 🔧', 'Vår app kan vara otillgänglig under kort tid för underhåll.', 'info')}
                >
                  <Text style={styles.templateButtonText}>Tekniskt meddelande</Text>
                </TouchableOpacity>

                {/* Säsong & Event */}
                <Text style={styles.templateCategoryTitle}>🎊 Säsong & Event</Text>
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Nyårserbjudande! 🎊', 'Fira det nya året med 25% rabatt på hela menyn! Gäller till 15/1.', 'promo')}
                >
                  <Text style={styles.templateButtonText}>Nyår</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Valentinsmeny ❤️', 'Romantisk middag för två! Specialmeny för alla kärlek.', 'promo')}
                >
                  <Text style={styles.templateButtonText}>Alla hjärtans dag</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Midsommar specialmeny 🌸', 'Fira midsommar med våra traditionella och moderna rätter!', 'info')}
                >
                  <Text style={styles.templateButtonText}>Midsommar</Text>
                </TouchableOpacity>

                {/* Kundrelationer */}
                <Text style={styles.templateCategoryTitle}>🤝 Kundrelationer</Text>
                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Tack för din feedback! 🙏', 'Vi uppskattar din recension och fortsätter att förbättra oss.', 'success')}
                >
                  <Text style={styles.templateButtonText}>Tack för feedback</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Vi saknar dig! 😊', 'Det har gått ett tag sedan ditt senaste besök. Kom tillbaka för en specialrabatt!', 'info')}
                >
                  <Text style={styles.templateButtonText}>Återkomst</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateButton}
                  onPress={() => applyTemplate('Belöning väntar! 🏆', 'Du har samlat tillräckligt med poäng för en gratis rätt!', 'success')}
                >
                  <Text style={styles.templateButtonText}>Belöning</Text>
                </TouchableOpacity>
              </View>
                </>
              )}

              {notificationActiveTab === 'admin' && (
                <View style={styles.adminNotificationSection}>
                  <View style={styles.adminNotificationHeader}>
                    <Text style={styles.sectionTitle}>🔔 Admin-notifikationer</Text>
                    <Text style={styles.sectionDescription}>
                      Hantera vilka notifikationer du vill få som admin
                    </Text>
                  </View>

                  {/* Beställningar kategori */}
                  <View style={styles.adminNotificationCategory}>
                    <Text style={styles.adminNotificationCategoryTitle}>📦 Beställningar</Text>
                    {getCategorySettings('orders').map((setting) => {
                      const IconComponent = getIconForSetting(setting.icon);
                      return (
                        <View key={setting.id} style={styles.adminNotificationItem}>
                          <View style={styles.adminNotificationItemLeft}>
                            <View style={styles.adminNotificationIcon}>
                              <IconComponent size={20} color={theme.colors.gold} />
                            </View>
                            <View style={styles.adminNotificationContent}>
                              <Text style={styles.adminNotificationTitle}>{setting.title}</Text>
                              <Text style={styles.adminNotificationDescription}>{setting.description}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.adminNotificationToggle,
                              setting.enabled && styles.adminNotificationToggleActive
                            ]}
                            onPress={() => toggleAdminNotificationSetting(setting.id)}
                          >
                            <View style={[
                              styles.adminNotificationToggleThumb,
                              setting.enabled && styles.adminNotificationToggleThumbActive
                            ]} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  {/* Bordsbokningar kategori */}
                  <View style={styles.adminNotificationCategory}>
                    <Text style={styles.adminNotificationCategoryTitle}>🍽️ Bordsbokningar</Text>
                    {getCategorySettings('bookings').map((setting) => {
                      const IconComponent = getIconForSetting(setting.icon);
                      return (
                        <View key={setting.id} style={styles.adminNotificationItem}>
                          <View style={styles.adminNotificationItemLeft}>
                            <View style={styles.adminNotificationIcon}>
                              <IconComponent size={20} color={theme.colors.gold} />
                            </View>
                            <View style={styles.adminNotificationContent}>
                              <Text style={styles.adminNotificationTitle}>{setting.title}</Text>
                              <Text style={styles.adminNotificationDescription}>{setting.description}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.adminNotificationToggle,
                              setting.enabled && styles.adminNotificationToggleActive
                            ]}
                            onPress={() => toggleAdminNotificationSetting(setting.id)}
                          >
                            <View style={[
                              styles.adminNotificationToggleThumb,
                              setting.enabled && styles.adminNotificationToggleThumbActive
                            ]} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  {/* Användare kategori */}
                  <View style={styles.adminNotificationCategory}>
                    <Text style={styles.adminNotificationCategoryTitle}>👥 Användare</Text>
                    {getCategorySettings('users').map((setting) => {
                      const IconComponent = getIconForSetting(setting.icon);
                      return (
                        <View key={setting.id} style={styles.adminNotificationItem}>
                          <View style={styles.adminNotificationItemLeft}>
                            <View style={styles.adminNotificationIcon}>
                              <IconComponent size={20} color={theme.colors.gold} />
                            </View>
                            <View style={styles.adminNotificationContent}>
                              <Text style={styles.adminNotificationTitle}>{setting.title}</Text>
                              <Text style={styles.adminNotificationDescription}>{setting.description}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.adminNotificationToggle,
                              setting.enabled && styles.adminNotificationToggleActive
                            ]}
                            onPress={() => toggleAdminNotificationSetting(setting.id)}
                          >
                            <View style={[
                              styles.adminNotificationToggleThumb,
                              setting.enabled && styles.adminNotificationToggleThumbActive
                            ]} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  {/* System kategori */}
                  <View style={styles.adminNotificationCategory}>
                    <Text style={styles.adminNotificationCategoryTitle}>⚙️ System</Text>
                    {getCategorySettings('system').map((setting) => {
                      const IconComponent = getIconForSetting(setting.icon);
                      return (
                        <View key={setting.id} style={styles.adminNotificationItem}>
                          <View style={styles.adminNotificationItemLeft}>
                            <View style={styles.adminNotificationIcon}>
                              <IconComponent size={20} color={theme.colors.gold} />
                            </View>
                            <View style={styles.adminNotificationContent}>
                              <Text style={styles.adminNotificationTitle}>{setting.title}</Text>
                              <Text style={styles.adminNotificationDescription}>{setting.description}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.adminNotificationToggle,
                              setting.enabled && styles.adminNotificationToggleActive
                            ]}
                            onPress={() => toggleAdminNotificationSetting(setting.id)}
                          >
                            <View style={[
                              styles.adminNotificationToggleThumb,
                              setting.enabled && styles.adminNotificationToggleThumbActive
                            ]} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  {/* Spara-knapp */}
                  <TouchableOpacity
                    style={styles.adminNotificationSaveButton}
                    onPress={saveAdminNotificationSettings}
                  >
                    <View style={styles.adminNotificationSaveButtonContent}>
                      <Check size={20} color="#111" />
                      <Text style={styles.adminNotificationSaveButtonText}>Spara inställningar</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        );
      case 'bookings':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={theme.colors.subtext} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök bokningar..."
                  placeholderTextColor={theme.colors.subtext}
                  value={bookingSearchQuery}
                  onChangeText={handleBookingSearch}
                />
                {bookingSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setBookingSearchQuery('')}>
                    <X size={16} color={theme.colors.subtext} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchBookings}
                disabled={bookingsLoading}
              >
                <Text style={styles.refreshButtonText}>Uppdatera</Text>
              </TouchableOpacity>
            </View>
            
            {bookingsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.gold} />
                <Text style={styles.loadingText}>Laddar bokningar...</Text>
              </View>
            ) : filteredBookings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Inga bokningar hittades</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={fetchBookings}
                >
                  <Text style={styles.emptyButtonText}>Uppdatera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                {filteredBookings.map((booking) => (
                  <View key={booking.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={styles.bookingName}>{booking.name}</Text>
                      <View style={[styles.statusBadge, { 
                        backgroundColor: booking.status === 'confirmed' ? '#4CAF50' : 
                                       booking.status === 'cancelled' ? '#F44336' : 
                                       '#FFC107' 
                      }]}>
                        <Text style={styles.statusText}>
                          {booking.status === 'pending' ? 'Väntar' : 
                           booking.status === 'confirmed' ? 'Bekräftad' : 
                           'Avbruten'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingDetailText}>📅 {booking.date} kl {booking.time}</Text>
                      <Text style={styles.bookingDetailText}>👥 {booking.guests}</Text>
                      <Text style={styles.bookingDetailText}>📧 {booking.email}</Text>
                      <Text style={styles.bookingDetailText}>📱 {booking.phone}</Text>
                      {booking.message && (
                        <Text style={styles.bookingDetailText}>💬 {booking.message}</Text>
                      )}
                    </View>
                    
                    <View style={styles.bookingActions}>
                      {booking.status === 'pending' && (
                        <>
                          <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                            onPress={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            <Text style={styles.actionButtonText}>Bekräfta</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            <Text style={styles.actionButtonText}>Avbryt</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                          onPress={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <Text style={styles.actionButtonText}>Avbryt</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <Text style={styles.bookingTimestamp}>
                      Bokad: {new Date(booking.created_at).toLocaleDateString('sv-SE')} {new Date(booking.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        );
      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>Välj en flik för att se innehåll</Text>
          </View>
        );
    }
  };

  if (!isLoggedIn || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Admin Panel',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        horizontal 
        style={styles.tabContainer}
        contentContainerStyle={styles.tabScrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <ShoppingBag 
            size={20} 
            color={activeTab === 'menu' ? theme.colors.gold : theme.colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'menu' && styles.activeTabText
            ]}
          >
            Meny
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Users 
            size={20} 
            color={activeTab === 'users' ? theme.colors.gold : theme.colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'users' && styles.activeTabText
            ]}
          >
            Användare
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <ShoppingBag 
            size={20} 
            color={activeTab === 'orders' ? theme.colors.gold : theme.colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'orders' && styles.activeTabText
            ]}
          >
            Ordrar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Calendar 
            size={20} 
            color={activeTab === 'bookings' ? theme.colors.gold : theme.colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'bookings' && styles.activeTabText
            ]}
          >
            Bokningar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings 
            size={20} 
            color={activeTab === 'settings' ? theme.colors.gold : theme.colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'settings' && styles.activeTabText
            ]}
          >
            Inställningar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Bell 
            size={20} 
            color={activeTab === 'notifications' ? theme.colors.gold : theme.colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'notifications' && styles.activeTabText
            ]}
          >
            Notiser
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === 'menu' && 'Menyhantering'}
          {activeTab === 'users' && 'Användarhantering'}
          {activeTab === 'orders' && 'Orderhantering'}
          {activeTab === 'bookings' && 'Bokningshantering'}
          {activeTab === 'settings' && 'Inställningar'}
          {activeTab === 'notifications' && 'Notifikationshantering'}
        </Text>
        <Text style={styles.subtitle}>
          {activeTab === 'menu' && 'Hantera menyartiklar, priser och kategorier'}
          {activeTab === 'users' && 'Hantera användare och deras behörigheter'}
          {activeTab === 'orders' && 'Hantera och spåra beställningar'}
          {activeTab === 'bookings' && 'Hantera bordsbokningar och se alla reservationer'}
          {activeTab === 'settings' && 'Hantera restaurangens inställningar'}
          {activeTab === 'notifications' && 'Skicka meddelanden och erbjudanden till användare'}
        </Text>
      </View>
      
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text, // Ändrat från subtext till text för att göra all text vit
  },
  subHeader: {
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 4,
  },
  navContainer: {
    marginTop: 16,
  },
  tabContainer: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    maxHeight: 80,
  },
  tabScrollContent: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.gold,
  },
  tabText: {
    marginTop: 4,
    fontSize: 10,
    color: theme.colors.text,
    textAlign: 'center',
  },
  activeTabText: {
    color: theme.colors.gold,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: theme.colors.text,
    fontSize: 16,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.text,
  },
  menuItemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 8,
    alignItems: 'center',
  },
  menuItemCell: {
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text, // Ändrat från subtext till text för att göra all text vit
  },
  menuItemName: {
    fontWeight: '500',
    color: theme.colors.text,
  },
  popularBadge: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 24,
  },
  comingSoonText: {
    textAlign: 'center',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 40,
  },
  navButton: {
    backgroundColor: theme.colors.gold,
    padding: 16,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: 24,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  smallModalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    width: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: theme.colors.text,
  },
  modalContent: {
    padding: 15,
    maxHeight: '60%',
  },
  smallModalContent: {
    padding: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.gold,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    marginBottom: 5,
    fontWeight: '500',
    color: theme.colors.text,
  },
  formInput: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    marginTop: 10,
    backgroundColor: theme.colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySelector: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.subtext,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    maxHeight: Platform.OS === 'ios' ? '80%' : '85%',
  },
  dropdownHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(220, 201, 145, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTitle: {
    color: theme.colors.gold,
    fontWeight: '600',
    fontSize: 16,
  },
  dropdown: {
    maxHeight: Platform.OS === 'ios' ? 350 : 400,
    width: '100%',
  },
  dropdownContentContainer: {
    paddingBottom: 5,
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 55,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(220, 201, 145, 0.2)',
  },
  dropdownItemText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  selectedMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarkText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  addNewCategoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(220, 201, 145, 0.1)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  addNewCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNewCategoryText: {
    color: theme.colors.gold,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  checkMark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: theme.colors.text,
  },
  actionButtonsContainer: {
    marginBottom: 16,
  },
  importButton: {
    backgroundColor: theme.colors.darkCard || '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  importButtonText: {
    color: theme.colors.gold,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: theme.colors.darkCard || '#333',
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: theme.colors.gold,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButton: {
    backgroundColor: theme.colors.gold,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nutritionInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nutritionInput: {
    width: '48%',
  },
  nutritionLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formInputWithButton: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    height: 45,
  },
  imagePickerButton: {
    backgroundColor: theme.colors.inputBg,
    padding: 10,
    height: 45,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: theme.colors.gold,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: theme.colors.subtext,
    marginTop: 5,
  },
  notificationForm: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 55,
  },
  dropdownItemText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  textInput: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    marginBottom: 16,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: theme.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  templatesSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  templateButton: {
    backgroundColor: theme.colors.inputBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  templateButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  templateCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  previewButton: {
    backgroundColor: theme.colors.gold,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  previewNotification: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  previewSuccess: {
    backgroundColor: 'rgba(50, 205, 50, 0.2)',
  },
  previewError: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  previewPromo: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
  },
  previewNotificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  previewNotificationMessage: {
    fontSize: 14,
    color: theme.colors.text,
  },
  previewDetails: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  soundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  schedulingDetails: {
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Booking styles
  bookingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  bookingDetailText: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookingTimestamp: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Användargränssnittet
  userCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  userActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  userTimestamp: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Modal stilar för EditUserModal
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    marginBottom: 5,
    fontWeight: '500',
    color: theme.colors.text,
    fontSize: 14,
  },
  formInput: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    marginTop: 5,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleOptionSelected: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(220, 201, 145, 0.1)',
  },
  roleOptionText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  roleOptionTextSelected: {
    fontWeight: 'bold',
    color: theme.colors.gold,
  },

  // Förbättrad redigera-knapp
  editUserButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Ordergränssnittet
  orderFilters: {
    marginBottom: 16,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusFilterButtonActive: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  statusFilterText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  orderPhone: {
    fontSize: 14,
    color: theme.colors.text,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  orderItemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: theme.colors.text,
    width: 30,
    fontWeight: '500',
  },
  orderItemText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    marginLeft: 8,
  },
  orderItemPrice: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  orderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Moderna Notification UI stilar
  notificationHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  notificationHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  notificationSubtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  notificationStatsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  notificationStatCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  notificationStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notificationStatLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: '500',
    textAlign: 'center',
  },
  notificationForm: {
    flex: 1,
  },
  notificationFormSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationFormHeader: {
    marginBottom: 20,
  },
  notificationInputGroup: {
    marginBottom: 20,
  },
  notificationInputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  notificationInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  notificationDropdownButton: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDropdownButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  notificationDropdownMenu: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notificationDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  notificationDropdownItemActive: {
    backgroundColor: theme.colors.gold + '15',
  },
  notificationDropdownItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  notificationDropdownItemTextActive: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  notificationSchedulingDetails: {
    marginTop: 16,
  },
  notificationSchedulingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationSchedulingCol: {
    flex: 1,
  },
  notificationTextInput: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 16,
  },
  notificationTextAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notificationCharacterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  notificationCharacterCount: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  notificationCharacterCountWarning: {
    color: '#F59E0B',
  },
  notificationSoundContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  notificationCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCheckboxChecked: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  notificationCheckboxLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  notificationPreviewSection: {
    marginBottom: 24,
  },
  notificationPreviewButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.gold + '30',
  },
  notificationPreviewButtonText: {
    fontSize: 16,
    color: theme.colors.gold,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationPreviewContainer: {
    marginTop: 16,
  },
  notificationPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  notificationPreviewNotification: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.gold,
  },
  notificationPreviewSuccess: {
    borderLeftColor: '#10B981',
  },
  notificationPreviewError: {
    borderLeftColor: '#EF4444',
  },
  notificationPreviewPromo: {
    borderLeftColor: '#F59E0B',
  },
  notificationPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationPreviewIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationPreviewNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  notificationPreviewNotificationMessage: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationPreviewDetails: {
    fontSize: 12,
    color: '#888',
  },
  notificationPreviewTime: {
    fontSize: 12,
    color: '#888',
  },
  notificationSendButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationSendButtonDisabled: {
    opacity: 0.5,
  },
  notificationSendButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationSendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
  },
  notificationTemplatesSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTemplatesHeader: {
    marginBottom: 20,
  },
  notificationTemplatesSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  notificationTemplatesSectionDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
  },
  notificationTemplateCategory: {
    marginBottom: 20,
  },
  notificationTemplateCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  notificationTemplateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  notificationTemplateButton: {
    backgroundColor: theme.colors.inputBg,
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notificationTemplatePromo: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B' + '15',
  },
  notificationTemplateButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  notificationTemplateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  // Notification tabs
  notificationTabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  notificationTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  notificationTabActive: {
    backgroundColor: theme.colors.gold + '20',
  },
  notificationTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  notificationTabTextActive: {
    color: theme.colors.gold,
  },

  // Admin notification settings
  adminNotificationSection: {
    flex: 1,
  },
  adminNotificationHeader: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  adminNotificationCategory: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  adminNotificationCategoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  adminNotificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  adminNotificationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  adminNotificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminNotificationContent: {
    flex: 1,
  },
  adminNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  adminNotificationDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
  },
  adminNotificationToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  adminNotificationToggleActive: {
    backgroundColor: theme.colors.gold,
  },
  adminNotificationToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  adminNotificationToggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  adminNotificationSaveButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  adminNotificationSaveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminNotificationSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
  },

  // Settings styles
  settingsSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  settingsInputGroup: {
    marginBottom: 20,
  },
  settingsLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginLeft: 8,
  },
  settingsInput: {
    backgroundColor: theme.colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingsTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  settingsToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveSettingsButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveSettingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});