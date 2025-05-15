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
  Image as ImageIcon
} from 'lucide-react-native';
import { useMenuStore } from '@/store/menu-store';
import ImagePickerModal from '@/components/Admin/ImagePickerModal';

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
    }
  }, [isLoggedIn, isAdmin]);

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
            style={styles.navButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.navButtonText}>Gå till Inställningar</Text>
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
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/admin/users')}
            >
              <Text style={styles.navButtonText}>Gå till Användarhantering</Text>
            </TouchableOpacity>
          </View>
        );
      case 'orders':
        return (
          <View style={styles.contentContainer}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/admin/orders')}
            >
              <Text style={styles.navButtonText}>Gå till Orderhantering</Text>
            </TouchableOpacity>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.contentContainer}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/admin/settings')}
            >
              <Text style={styles.navButtonText}>Gå till Inställningar</Text>
            </TouchableOpacity>
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
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <ShoppingBag 
            size={24} 
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
            size={24} 
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
            size={24} 
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
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings 
            size={24} 
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
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === 'menu' && 'Menyhantering'}
          {activeTab === 'users' && 'Användarhantering'}
          {activeTab === 'orders' && 'Orderhantering'}
          {activeTab === 'settings' && 'Inställningar'}
        </Text>
        <Text style={styles.subtitle}>
          {activeTab === 'menu' && 'Hantera menyartiklar, priser och kategorier'}
          {activeTab === 'users' && 'Hantera användare och deras behörigheter'}
          {activeTab === 'orders' && 'Hantera och spåra beställningar'}
          {activeTab === 'settings' && 'Hantera restaurangens inställningar'}
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
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.gold,
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.text,
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
});