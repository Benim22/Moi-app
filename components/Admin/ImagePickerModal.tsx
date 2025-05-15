import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { theme } from '@/constants/theme';
import { X, Search, ImageOff } from 'lucide-react-native';

interface ImageFile {
  id: string;
  name: string;
  publicUrl: string;
}

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelect: (url: string) => void;
  bucketName?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
// Anpassa antal kolumner baserat på skärmbredd
const getNumColumns = () => {
  // För små skärmar (mobil)
  if (SCREEN_WIDTH < 500) {
    return 2;
  }
  // För mellanstora skärmar (tablet)
  else if (SCREEN_WIDTH < 800) {
    return 3;
  }
  // För större skärmar
  return 4;
};

const NUM_COLUMNS = getNumColumns();
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - (ITEM_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;
// För horisontell scrollning på mobil när man söker
const MOBILE_ITEM_WIDTH = SCREEN_WIDTH / 2.5;

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelect,
  bucketName = 'menuimages', // Default bucket name
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHorizontalScroll, setIsHorizontalScroll] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(`[ImagePickerModal] Fetching images from bucket: ${bucketName}`); // Logg 1
    try {
      const { data: fileList, error: listError } = await supabase.storage
        .from(bucketName)
        .list(undefined, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      console.log('[ImagePickerModal] supabase.storage.list() response:', { fileList, listError }); // Logg 2

      if (listError) {
        console.error('[ImagePickerModal] Error listing files:', listError); // Logg 3
        throw listError;
      }

      if (fileList && fileList.length > 0) {
        console.log(`[ImagePickerModal] ${fileList.length} files listed. Processing them...`); // Logg 4
        const imageFiles: ImageFile[] = await Promise.all(
          fileList
            .filter(file => {
              const shouldKeep = !file.name.startsWith('.');
              // console.log(`[ImagePickerModal] Filtering file: ${file.name}, keeping: ${shouldKeep}`); // Kan vara för mycket loggning, men användbart vid behov
              return shouldKeep;
            })
            .map(async (file) => {
              console.log(`[ImagePickerModal] Getting public URL for: ${file.name}`); // Logg 5
              const { data: publicUrlData, error: urlError } = supabase.storage
                .from(bucketName)
                .getPublicUrl(file.name);
              
              console.log(`[ImagePickerModal] Public URL data for ${file.name}:`, { publicUrl: publicUrlData.publicUrl, urlError }); // Logg 6

              if (urlError) {
                console.error(`[ImagePickerModal] Error getting public URL for ${file.name}:`, urlError); // Logg 7
                // Returnera ett objekt som kan filtreras bort senare eller hanteras specifikt
                // istället för att låta hela Promise.all misslyckas direkt.
                // Beroende på hur kritiskt det är att varje URL hämtas.
                // För nu, låt oss logga och fortsätta, publicUrl blir null.
              }

              return {
                id: file.id ?? file.name,
                name: file.name,
                publicUrl: publicUrlData.publicUrl,
              };
            })
        );
        
        const validImageFiles = imageFiles.filter(img => img.publicUrl); // Filtrera bort de som inte fick en URL
        console.log('[ImagePickerModal] Processed image files (with public URLs):', validImageFiles); // Logg 8
        setImages(validImageFiles);
        if (validImageFiles.length === 0 && fileList.length > 0) {
            console.warn('[ImagePickerModal] No valid public URLs obtained, though files were listed.'); // Logg 9
            setError(`Kunde inte hämta giltiga URL:er för bilderna. Kontrollera RLS-policyer för storage.objects och att bucketen '${bucketName}' är publik.`);
        }

      } else {
        console.log('[ImagePickerModal] No files found in bucket or fileList is empty.'); // Logg 10
        setImages([]); // Säkerställ att images är tom om inga filer finns
      }
    } catch (err: any) {
      console.error('[ImagePickerModal] General error in fetchImages:', err); // Logg 11
      setError(`Kunde inte ladda bilder: ${err.message}`);
      Alert.alert('Fel', `Ett allvarligt fel uppstod när bilder skulle laddas från "${bucketName}". Detaljer: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('[ImagePickerModal] Finished fetching images.'); // Logg 12
    }
  }, [bucketName]);

  useEffect(() => {
    if (visible) {
      fetchImages();
    }
  }, [visible, fetchImages]);

  // Avgör om vi ska använda horisontell scrollning baserat på söktermen och skärmstorlek
  useEffect(() => {
    // Aktivera horisontell scrollning på små skärmar när man söker
    setIsHorizontalScroll(searchTerm.length > 0 && SCREEN_WIDTH < 500);
  }, [searchTerm]);

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectImage = (image: ImageFile) => {
    onImageSelect(image.publicUrl);
    onClose();
  };

  const renderImageItem = ({ item }: { item: ImageFile }) => (
    <TouchableOpacity 
      onPress={() => handleSelectImage(item)} 
      style={[
        styles.imageItem, 
        isHorizontalScroll && styles.horizontalImageItem
      ]}
    >
      <Image 
        source={{ uri: item.publicUrl }} 
        style={styles.imagePreview} 
        resizeMode="cover" 
      />
      <Text style={styles.imageName} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => {
    if (loading) return null; // Visa inte "Inga bilder" när det laddas
    return (
        <View style={styles.emptyContainer}>
            <ImageOff size={48} color={theme.colors.subtext} />
            <Text style={styles.emptyText}>
                {error ? error : `Inga bilder hittades i "${bucketName}"` + (searchTerm ? ' för din sökning.' : '.')}
            </Text>
            {error && (
                 <TouchableOpacity onPress={fetchImages} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Försök igen</Text>
                </TouchableOpacity>
            )}
        </View>
    );
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Välj Bild från "{bucketName}"</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.subtext} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Sök bildnamn..."
              placeholderTextColor={theme.colors.subtext}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearchButton}>
                    <X size={16} color={theme.colors.subtext} />
                </TouchableOpacity>
            )}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.gold} />
              <Text style={styles.loadingText}>Laddar bilder...</Text>
            </View>
          )}
          
          {!loading && filteredImages.length === 0 && renderEmptyState()}

          {!loading && filteredImages.length > 0 && (
            isHorizontalScroll ? (
              <FlatList
                data={filteredImages}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.horizontalListContainer}
                initialNumToRender={5}
                maxToRenderPerBatch={8}
                windowSize={11}
                removeClippedSubviews={Platform.OS !== 'web'}
              />
            ) : (
              <FlatList
                data={filteredImages}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                numColumns={NUM_COLUMNS}
                key={NUM_COLUMNS}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={true}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={11}
                removeClippedSubviews={Platform.OS !== 'web'}
              />
            )
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    height: Platform.OS === 'web' ? '85%' : '90%', // Lite högre på mobil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: theme.colors.text,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.subtext,
    fontSize: 16,
  },
  listContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  horizontalListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  imageItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 0.9 + 30,
    margin: ITEM_MARGIN / 2,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  horizontalImageItem: {
    width: MOBILE_ITEM_WIDTH,
    height: MOBILE_ITEM_WIDTH * 1.2,
    marginHorizontal: 6,
  },
  imagePreview: {
    width: '100%',
    height: ITEM_WIDTH * 0.8,
    borderRadius: theme.borderRadius.xs,
    marginBottom: 5,
  },
  imageName: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: theme.colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.sm,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ImagePickerModal; 