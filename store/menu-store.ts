import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// Definiera plats-typen
export type Location = {
  id: string;
  name: string;
  address: string;
  fullMenu?: boolean;
  onlyPokebowl?: boolean;
  comingSoon?: boolean;
};

// Definiera kategori-typen
export type Category = {
  id: string;
  name: string;
};

// Definiera menyobjektets typ
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags?: string[];
  popular?: boolean;
  isPopular?: boolean;
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  nutritionalValues?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
    salt?: number;
  };
  spicyLevel?: number;
};

// Definiera typen för tillståndet
type MenuState = {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  loadMenu: () => Promise<void>;
  getMenuItemById: (id: string) => MenuItem | undefined;
  getMenuItemsByCategory: (category: string) => MenuItem[];
  searchMenuItems: (query: string) => MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem | null>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (id: string) => Promise<boolean>;
  importMenuFromStatic: () => Promise<boolean>;
};

// Skapa några exempelmenyobjekt
const sampleMenuItems: MenuItem[] = [
  {
    id: 'sushi-1',
    name: 'Lax Nigiri',
    description: 'Färsk lax på traditionellt sushiris',
    price: 35,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Nigiri'
  },
  {
    id: 'sushi-2',
    name: 'Tonfisk Maki',
    description: 'Färsk tonfisk med avokado och gurka',
    price: 95,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Maki'
  },
  {
    id: 'sushi-3',
    name: 'Vegetarisk Roll',
    description: 'Avokado, gurka och mango',
    price: 85,
    image: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Maki'
  },
  {
    id: 'sushi-4',
    name: 'Lax Sashimi',
    description: 'Tunnskivad färsk lax',
    price: 115,
    image: 'https://images.unsplash.com/photo-1584583570840-0d6d0cb0a840?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Sashimi'
  }
];

// Exempel på platser (för att ersätta de som importeras från mocks/menu)
export const locations: Location[] = [
  { id: 'trelleborg', name: 'Trelleborg', address: 'Corfitz-Beck-Friisgatan 5B, 231 43, Trelleborg', fullMenu: true },
  { id: 'ystad', name: 'Ystad', address: 'Stora Östergatan 39, 271 35, Ystad', fullMenu: false, onlyPokebowl: true },
  { id: 'malmo', name: 'Malmö', address: 'Öppnar snart!', comingSoon: true },
];

// Standardisera från Supabase DB till lokal MenuItem
const formatFromSupabase = (item: any): MenuItem => {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: parseFloat(item.price) || 0,
    image: item.image || '',
    category: item.category || '',
    tags: item.tags || [],
    popular: item.popular || false,
    ingredients: item.ingredients || [],
    allergens: item.allergens || [],
    preparationTime: item.preparation_time || '',
    nutritionalInfo: item.nutritional_info || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    spicyLevel: item.spicy_level || 0
  };
};

// Standardisera från lokal MenuItem till Supabase DB
const formatForSupabase = (item: Partial<MenuItem>) => {
  // Skapa en kopia för att undvika att modifiera originalet
  const supabaseItem: any = {};
  
  // Kopiera vanliga fält
  supabaseItem.name = item.name || '';
  supabaseItem.description = item.description || '';
  supabaseItem.price = item.price || 0;
  supabaseItem.image = item.image || '';
  supabaseItem.category = item.category || '';
  supabaseItem.popular = item.popular || false;
  supabaseItem.tags = Array.isArray(item.tags) ? item.tags : [];
  supabaseItem.ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
  supabaseItem.allergens = Array.isArray(item.allergens) ? item.allergens : [];
  
  // Anpassa nycklar till snake_case för Supabase
  supabaseItem.preparation_time = item.preparationTime || '';
  supabaseItem.spicy_level = item.spicyLevel || 0;
  
  // Hantera nutritional_info särskilt
  if (item.nutritionalInfo) {
    // Se till att nutritionalInfo är ett giltigt objekt
    supabaseItem.nutritional_info = {
      calories: parseFloat(item.nutritionalInfo.calories?.toString() || '0') || 0,
      protein: parseFloat(item.nutritionalInfo.protein?.toString() || '0') || 0,
      carbs: parseFloat(item.nutritionalInfo.carbs?.toString() || '0') || 0,
      fat: parseFloat(item.nutritionalInfo.fat?.toString() || '0') || 0
    };
  } else {
    // Sätt standardvärden om nutritionalInfo saknas
    supabaseItem.nutritional_info = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
  
  return supabaseItem;
};

// Skapa zustand-store
export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      items: [],
      categories: [],
      isLoading: false,

      loadMenu: async () => {
        set({ isLoading: true });
        
        try {
          console.log('[MenuStore] Försöker hämta meny från Supabase');
          
          // Försök hämta från Supabase först
          const { data, error } = await supabase
            .from('menu_items')
            .select('*');
          
          if (error) {
            console.error('[MenuStore] Supabase error:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            console.log(`[MenuStore] Hittade ${data.length} menyposter i Supabase`);
            
            // Konvertera från Supabase format till lokal MenuItem
            const formattedItems = data.map(formatFromSupabase);
            
            // Extrahera unika kategorier och sortera dem
            const uniqueCategories = [...new Set(formattedItems.map(item => item.category))];
            console.log('[MenuStore] Hittade följande kategorier:', uniqueCategories.join(', '));
            
            set({ 
              items: formattedItems,
              categories: uniqueCategories,
              isLoading: false 
            });
            
            console.log('[MenuStore] Menyn laddad från Supabase');
            return;
          }

          console.log('[MenuStore] Inga poster hittades i Supabase, använder exempeldata');
          // Om ingen data finns, använd sampleMenuItems
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            items: sampleMenuItems,
            categories: [...new Set(sampleMenuItems.map(item => item.category))],
            isLoading: false 
          });
        } catch (error) {
          console.error('[MenuStore] Error loading menu:', error);
          
          // Fallback till exempeldata vid fel
          console.log('[MenuStore] Använder exempeldata som fallback');
          set({ 
            items: sampleMenuItems,
            categories: [...new Set(sampleMenuItems.map(item => item.category))],
            isLoading: false 
          });
        }
      },

      getMenuItemById: (id: string) => {
        return get().items.find(item => item.id === id);
      },

      getMenuItemsByCategory: (category: string) => {
        return get().items.filter(item => item.category === category);
      },

      searchMenuItems: (query: string) => {
        const lowerCaseQuery = query.toLowerCase();
        return get().items.filter(item => 
          item.name.toLowerCase().includes(lowerCaseQuery) || 
          item.description.toLowerCase().includes(lowerCaseQuery)
        );
      },
      
      addMenuItem: async (item: Omit<MenuItem, 'id'>) => {
        try {
          set({ isLoading: true });
          console.log('[MenuStore] Adding new menu item:', item.name);
          
          // Formatera för Supabase
          const supabaseItem = formatForSupabase(item);
          console.log('[MenuStore] Formatted for Supabase:', JSON.stringify(supabaseItem, null, 2));
          
          // Lägg till i Supabase
          let newItem: MenuItem;
          
          if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
            try {
              console.log('[MenuStore] Attempting to insert item into Supabase...');
              
              // Kontrollera användarens roll först för att debugga
              const { data: userData, error: userError } = await supabase.auth.getUser();
              console.log('[MenuStore] Current user:', userData?.user?.id);
              
              if (userError) {
                console.error('[MenuStore] Error getting user:', userError);
              }
              
              // Försök hämta profilen för att se rollen
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userData?.user?.id)
                .single();
                
              console.log('[MenuStore] User profile role:', profileData?.role);
              
              if (profileError) {
                console.error('[MenuStore] Error fetching profile:', profileError);
              }
              
              const { data, error } = await supabase
                .from('menu_items')
                .insert([supabaseItem])
                .select()
                .single();
              
              if (error) {
                console.error('[MenuStore] Supabase insert error:', error);
                console.error('[MenuStore] Error details:', JSON.stringify(error, null, 2));
                throw { message: 'Kunde inte lägga till i databasen', error };
              }
              
              if (!data) {
                console.error('[MenuStore] No data returned from Supabase insert');
                throw new Error('Ingen data returnerades från databasen');
              }
              
              // Konvertera tillbaka till MenuItem
              newItem = formatFromSupabase(data);
              console.log('[MenuStore] Successfully added to Supabase with ID:', newItem.id);
            } catch (supabaseError) {
              console.error('[MenuStore] Supabase operation failed:', supabaseError);
              
              // Försök med lokalt ID istället
              if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
                const localId = `local-${Date.now()}`;
                newItem = { ...item, id: localId };
                console.log('[MenuStore] Using local ID fallback:', localId);
              } else {
                // Om Supabase är konfigurerad men misslyckades, kasta vidare felet
                set({ isLoading: false });
                throw supabaseError;
              }
            }
          } else {
            // Om Supabase inte är konfigurerad, skapa en lokal menypost
            const localId = `local-${Date.now()}`;
            newItem = { ...item, id: localId };
            console.log('[MenuStore] Using local ID (no Supabase config):', localId);
          }
          
          // Uppdatera lokal store
          const updatedItems = [...get().items, newItem];
          const updatedCategories = [...new Set(updatedItems.map(item => item.category))];
          
          console.log('[MenuStore] Updating local store with new item');
          set({ 
            items: updatedItems,
            categories: updatedCategories,
            isLoading: false 
          });
          
          return newItem;
        } catch (error) {
          console.error('[MenuStore] Error adding menu item:', error);
          set({ isLoading: false });
          throw error; // Kasta vidare felet så att UI kan visa bättre felmeddelanden
        }
      },
      
      updateMenuItem: async (id: string, updates: Partial<MenuItem>) => {
        try {
          set({ isLoading: true });
          
          // Formatera för Supabase
          const supabaseUpdates = formatForSupabase(updates);
          
          // Uppdatera i Supabase
          const { data, error } = await supabase
            .from('menu_items')
            .update(supabaseUpdates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          // Konvertera tillbaka till MenuItem
          const updatedItem = formatFromSupabase(data);
          
          // Uppdatera lokal store
          const currentItems = get().items;
          const itemIndex = currentItems.findIndex(item => item.id === id);
          
          if (itemIndex === -1) {
            set({ isLoading: false });
            return null;
          }
          
          const updatedItems = [...currentItems];
          updatedItems[itemIndex] = updatedItem;
          
          const updatedCategories = [...new Set(updatedItems.map(item => item.category))];
          
          set({ 
            items: updatedItems,
            categories: updatedCategories,
            isLoading: false 
          });
          
          return updatedItem;
        } catch (error) {
          console.error('Error updating menu item:', error);
          set({ isLoading: false });
          
          // Fallback - uppdatera lokalt om Supabase misslyckas
          if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
            // Hitta och uppdatera item lokalt
            const currentItems = get().items;
            const itemIndex = currentItems.findIndex(item => item.id === id);
            
            if (itemIndex === -1) {
              set({ isLoading: false });
              return null;
            }
            
            const updatedItem = {
              ...currentItems[itemIndex],
              ...updates
            };
            
            // Uppdatera lokal store
            const updatedItems = [...currentItems];
            updatedItems[itemIndex] = updatedItem;
            
            const updatedCategories = [...new Set(updatedItems.map(item => item.category))];
            
            set({ 
              items: updatedItems,
              categories: updatedCategories,
              isLoading: false 
            });
            
            return updatedItem;
          }
          
          return null;
        }
      },
      
      deleteMenuItem: async (id: string) => {
        try {
          set({ isLoading: true });
          console.log(`[MenuStore] Attempting to delete item with ID: ${id}`);
          
          // Kontrollera om id är en giltig UUID
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          
          // Ta bort från Supabase om det finns en giltig URL
          if (isUuid && process.env.EXPO_PUBLIC_SUPABASE_URL) {
            console.log(`[MenuStore] ID is a valid UUID, attempting Supabase delete`);
            
            try {
              const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);
              
              if (error) {
                console.error(`[MenuStore] Supabase delete error:`, error);
                // Fortsätt ändå för att uppdatera lokal store
              } else {
                console.log(`[MenuStore] Supabase delete successful`);
              }
            } catch (supabaseError) {
              console.error(`[MenuStore] Supabase operation failed:`, supabaseError);
              // Fortsätt ändå och uppdatera lokal store
            }
          } else {
            console.log(`[MenuStore] ID is not a UUID or Supabase URL not configured, using local delete only`);
          }
          
          // Uppdatera lokal store oavsett om Supabase lyckas eller inte
          const currentItems = get().items;
          console.log(`[MenuStore] Current items in store: ${currentItems.length}`);
          
          const itemToDelete = currentItems.find(item => item.id === id);
          if (!itemToDelete) {
            console.error(`[MenuStore] Item with ID ${id} not found in local store`);
            set({ isLoading: false });
            return false;
          }
          
          console.log(`[MenuStore] Found item to delete: ${itemToDelete.name} (${itemToDelete.id})`);
          const updatedItems = currentItems.filter(item => item.id !== id);
          console.log(`[MenuStore] Items after filter: ${updatedItems.length}`);
          
          const updatedCategories = [...new Set(updatedItems.map(item => item.category))];
          
          console.log(`[MenuStore] Updating local store: removing item ${id}`);
          set({ 
            items: updatedItems,
            categories: updatedCategories,
            isLoading: false 
          });
          
          return true;
        } catch (error) {
          console.error('[MenuStore] Error deleting menu item:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      importMenuFromStatic: async () => {
        set({ isLoading: true });
        console.log('[MenuStore] Starting import of menu items from menu.tsx');
        
        try {
          // Hämta den statiska menyn från menuData
          let menuData;
          try {
            menuData = require('@/app/(tabs)/menu').menuData;
            console.log('[MenuStore] Successfully loaded menuData from menu.tsx');
          } catch (importError) {
            console.error('[MenuStore] Error importing menuData:', importError);
            set({ isLoading: false });
            return false;
          }
          
          if (!menuData) {
            console.error('[MenuStore] Could not find menuData in menu.tsx');
            set({ isLoading: false });
            return false;
          }
          
          // Skapa en lista av alla menyposter från alla kategorier
          const allMenuItems: MenuItem[] = [];
          let importCount = 0;
          let errorCount = 0;
          
          // Gå igenom varje kategorinamn i menuData
          for (const categoryName in menuData) {
            console.log(`[MenuStore] Processing category: ${categoryName}`);
            const categoryItems = menuData[categoryName];
            
            // Kontrollera att kategorins innehåll är en array
            if (!Array.isArray(categoryItems)) {
              console.log(`[MenuStore] Skipping non-array category: ${categoryName}`);
              continue;
            }
            
            console.log(`[MenuStore] Found ${categoryItems.length} items in category ${categoryName}`);
            
            // Gå igenom varje menyobjekt i kategorin
            for (const item of categoryItems) {
              try {
                if (!item || !item.name) {
                  console.log(`[MenuStore] Skipping invalid item in category ${categoryName}`);
                  continue;
                }
                
                console.log(`[MenuStore] Processing item: ${item.name}`);
                
                // Försök konvertera pris till nummer om det är en sträng
                let price = 0;
                if (typeof item.price === 'string') {
                  // Ta bort all icke-numerisk text (som "kr")
                  const priceStr = item.price.replace(/[^0-9.,]/g, '').replace(',', '.');
                  price = parseFloat(priceStr);
                  if (isNaN(price)) price = 0;
                } else if (typeof item.price === 'number') {
                  price = item.price;
                }
                
                // Skapa menyobjekt med säkra standardvärden
                const menuItem: Omit<MenuItem, 'id'> = {
                  name: item.name,
                  description: item.description || '',
                  price: price,
                  image: item.image || '',
                  category: categoryName,
                  popular: !!item.popular,
                  ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
                  allergens: Array.isArray(item.allergens) ? item.allergens : [],
                  preparationTime: item.preparationTime || '',
                  nutritionalInfo: {
                    calories: parseFloat(item.nutritionalInfo?.calories?.toString() || '0') || 0,
                    protein: parseFloat(item.nutritionalInfo?.protein?.toString() || '0') || 0,
                    carbs: parseFloat(item.nutritionalInfo?.carbs?.toString() || '0') || 0,
                    fat: parseFloat(item.nutritionalInfo?.fat?.toString() || '0') || 0
                  },
                  spicyLevel: parseInt(item.spicyLevel?.toString() || '0') || 0
                };
                
                // Lägg till i Supabase om konfigurerad
                let newItem: MenuItem;
                if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
                  console.log(`[MenuStore] Attempting to add item to Supabase: ${menuItem.name}`);
                  
                  try {
                    // Formatera för Supabase
                    const supabaseItem = formatForSupabase(menuItem);
                    console.log(`[MenuStore] Formatted for Supabase:`, supabaseItem);
                    
                    // Lägg till i Supabase
                    const { data, error } = await supabase
                      .from('menu_items')
                      .insert([supabaseItem])
                      .select()
                      .single();
                    
                    if (error) {
                      console.error(`[MenuStore] Supabase insert error for ${menuItem.name}:`, error);
                      throw error;
                    }
                    
                    if (!data) {
                      console.error('[MenuStore] No data returned from Supabase insert');
                      throw new Error('Ingen data returnerades från databasen');
                    }
                    
                    newItem = formatFromSupabase(data);
                    console.log(`[MenuStore] Added to Supabase with ID: ${newItem.id}`);
                  } catch (supabaseError) {
                    console.error(`[MenuStore] Failed to add item to Supabase: ${menuItem.name}`, supabaseError);
                    
                    // Fallback till lokal ID
                    const localId = `local-${Date.now()}-${importCount}`;
                    newItem = { ...menuItem, id: localId };
                    console.log(`[MenuStore] Created local item with ID: ${localId}`);
                  }
                } else {
                  // Skapa med lokalt ID om Supabase inte är konfigurerad
                  const localId = `local-${Date.now()}-${importCount}`;
                  newItem = { ...menuItem, id: localId };
                  console.log(`[MenuStore] Created local item with ID: ${localId} (Supabase not configured)`);
                }
                
                // Lägg till i allMenuItems-listan
                allMenuItems.push(newItem);
                importCount++;
                console.log(`[MenuStore] Successfully imported: ${newItem.name}`);
              } catch (itemError) {
                console.error(`[MenuStore] Error processing item ${item.name}:`, itemError);
                errorCount++;
              }
            }
          }
          
          console.log(`[MenuStore] Import completed. Imported: ${importCount}, Errors: ${errorCount}`);
          
          if (importCount === 0) {
            console.log(`[MenuStore] No items were imported successfully`);
            set({ isLoading: false });
            return false;
          }
          
          // Uppdatera lokal store med importerade menyposter
          set({
            items: allMenuItems,
            categories: [...new Set(allMenuItems.map(item => item.category))],
            isLoading: false
          });
          
          return true;
        } catch (error) {
          console.error('[MenuStore] Error importing menu:', error);
          set({ isLoading: false });
          return false;
        }
      }
    }),
    {
      name: 'menu-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 