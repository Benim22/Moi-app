import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
  avatar_url?: string;
}

interface UserState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null, user: User | null, message: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  updateProfile: (userData: Partial<UserProfile>) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
  diagnosticCheck: () => Promise<{ status: string; message: string; error?: any; user: User | null; profile: UserProfile | null }>;
}

// Hjälpfunktion för att kontrollera och skapa profil om den saknas
const checkAndCreateProfileIfNeeded = async (userId: string, email: string | undefined): Promise<boolean> => {
  if (!userId) {
    console.error('Inget användar-ID tillhandahållet');
    return false;
  }

  try {
    // Kontrollera först om profilen finns
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    // Om vi har data eller ett fel som inte är "not found"
    if (existingProfile) {
      console.log('Profil hittades redan:', existingProfile.id);
      return true;
    }

    console.log('Profil saknas, försöker skapa ny profil för:', userId);
    
    // Försök att skapa profilen
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email || '',
        name: '',
        phone: '',
        role: 'user',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        console.log('Profil verkar redan finnas (kollision vid skapande)');
        return true; // Anta att profilen redan finns och fortsätt
      }
      
      console.error('Fel vid skapande av profil:', insertError);
      return false;
    }
    
    console.log('Ny profil skapad för:', userId);
    return true;
  } catch (error) {
    console.error('Oväntat fel vid kontroll/skapande av profil:', error);
    return false;
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      isLoggedIn: false,
      isAdmin: false,
      isLoading: false,
      
      setSession: (session) => {
        set({ 
          session,
          user: session?.user || null,
          isLoggedIn: !!session
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setProfile: (profile) => {
        set({ 
          profile,
          isAdmin: profile?.role === 'admin'
        });
      },
      
      login: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!error && data.session) {
            set({ 
              session: data.session,
              user: data.user,
              isLoggedIn: true
            });
            
            await get().refreshProfile();
          }
          
          return { error };
        } finally {
          set({ isLoading: false });
        }
      },
      
      signUp: async (email, password, name) => {
        set({ isLoading: true });
        
        try {
          // 1. Skapa användaren i auth.users via Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name
              },
              emailRedirectTo: 'moisushi://login' // Redirect URL efter verifiering
            }
          });
          
          if (authError || !authData.user) {
            console.error('Fel vid skapande av användare:', authError);
            return { 
              error: authError, 
              user: null, 
              message: 'Ett fel uppstod vid registrering av användare.' 
            };
          }

          // 2. Skapa profil i profiles-tabellen
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              name: name,
              email: email,
              phone: '',
              role: 'user',
              updated_at: new Date().toISOString(),
            });

          if (profileError && profileError.code !== '23505') {
            console.error('Fel vid skapande av profil:', profileError);
            return { 
              error: profileError, 
              user: null, 
              message: 'Ett fel uppstod vid skapande av användarprofil.' 
            };
          }

          // 3. Returnera framgångsrikt utan att logga in användaren
          return { 
            error: null, 
            user: authData.user,
            message: 'Kontrollera din e-post för att verifiera ditt konto innan du loggar in.'
          };
        } catch (error) {
          console.error('Oväntat fel vid registrering:', error);
          return { 
            error, 
            user: null, 
            message: 'Ett oväntat fel uppstod vid registrering.' 
          };
        } finally {
          set({ isLoading: false });
        }
      },
      
      loginWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'moisushi://login-callback',
          },
        });
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await supabase.auth.signOut();
          
          set({
            session: null,
            user: null,
            profile: null,
            isLoggedIn: false,
            isAdmin: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateProfile: async (userData) => {
        const { user } = get();
        
        if (!user) {
          console.error('Ingen användare hittad');
          return { error: new Error('Användaren är inte autentiserad') };
        }
        
        try {
          set({ isLoading: true });
          
          // Kontrollera om profilen finns och skapa den om den saknas
          const profileExists = await checkAndCreateProfileIfNeeded(user.id, user.email);
          if (!profileExists) {
            set({ isLoading: false });
            return { error: new Error('Kunde inte säkerställa att profilen finns') };
          }
          
          console.log('Uppdaterar profil för användare:', user.id);
          console.log('Data att uppdatera:', userData);
          
          const { data, error } = await supabase
            .from('profiles')
            .update({
              ...userData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
            .select()
            .single();
            
          if (error) {
            console.error('Fel vid uppdatering av profil:', error.message);
            console.error('Feldetaljer:', error);
            set({ isLoading: false });
            return { error };
          }
          
          console.log('Profil uppdaterad:', data);
          
          if (data) {
            set({ profile: data as UserProfile });
          }
          
          set({ isLoading: false });
          return { error: null };
        } catch (error: any) {
          console.error('Fel i updateProfile:', error.message);
          console.error('Feldetaljer:', error);
          set({ isLoading: false });
          return { error };
        }
      },
      
      refreshProfile: async () => {
        const { user } = get();
        
        if (!user) {
          console.log('Ingen användare hittad vid refresh');
          return;
        }
        
        try {
          console.log('Refreshing profile for user:', user.id);
          
          // Försök hämta profilen direkt först
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Fel vid hämtning av profil:', error.message);
            console.error('Feldetaljer:', {
              code: error.code,
              message: error.message, 
              details: error.details,
              hint: error.hint
            });
            
            // Om vi inte kunde hämta profilen, försök skapa en ny
            if (error.code !== '42P17') { // Undvik att fortsätta om det är rekursionsfel
              const profileExists = await checkAndCreateProfileIfNeeded(user.id, user.email);
              if (!profileExists) {
                console.error('Kunde inte säkerställa att profilen finns');
              }
            }
            return;
          }
            
          if (data) {
            console.log('Profil uppdaterad:', data);
            set({ 
              profile: data as UserProfile,
              isAdmin: data.role === 'admin'
            });
          } else {
            console.log('Ingen profildata hittades, försöker skapa en');
            const profileExists = await checkAndCreateProfileIfNeeded(user.id, user.email);
            if (profileExists) {
              // Försök hämta profilen igen efter att den har skapats
              const { data: newData, error: newError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
                
              if (!newError && newData) {
                console.log('Ny profil hämtad:', newData);
                set({ 
                  profile: newData as UserProfile,
                  isAdmin: newData.role === 'admin'
                });
              }
            }
          }
        } catch (error: any) {
          console.error('Oväntat fel i refreshProfile:', error.message);
          console.error('Feldetaljer:', error);
        }
      },
      
      diagnosticCheck: async () => {
        const { user } = get();
        
        if (!user) {
          console.log('Diagnostik: Ingen användare inloggad');
          return { 
            status: 'error', 
            message: 'Ingen användare inloggad',
            user: null,
            profile: null 
          };
        }
        
        console.log('Diagnostik: Kontrollerar autentisering...');
        
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !sessionData.session) {
            console.log('Diagnostik: Ingen giltig session', sessionError);
            return { 
              status: 'error', 
              message: 'Ingen giltig session', 
              error: sessionError,
              user,
              profile: null
            };
          }
          
          console.log('Diagnostik: Session hittad', sessionData.session.user.id);
          
          console.log('Diagnostik: Kontrollerar profil...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.log('Diagnostik: Fel vid hämtning av profil', profileError);
            
            // Försök skapa en profil
            console.log('Diagnostik: Försöker skapa profil');
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                name: '',
                role: 'user',
                updated_at: new Date().toISOString(),
              });
              
            if (createError) {
              console.log('Diagnostik: Kunde inte skapa profil', createError);
              return { 
                status: 'error', 
                message: 'Kunde inte skapa profil', 
                error: createError,
                user,
                profile: null
              };
            }
            
            // Hämta den nyskapade profilen
            const { data: newProfile, error: newProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (newProfileError) {
              console.log('Diagnostik: Kunde inte hämta nyskapad profil', newProfileError);
              return { 
                status: 'error', 
                message: 'Kunde inte hämta nyskapad profil', 
                error: newProfileError,
                user,
                profile: null
              };
            }
            
            console.log('Diagnostik: Profil skapad', newProfile);
            return { 
              status: 'success', 
              message: 'Profil skapad', 
              user,
              profile: newProfile
            };
          }
          
          console.log('Diagnostik: Profil hittad', profileData);
          return { 
            status: 'success', 
            message: 'Användare och profil hittade', 
            user,
            profile: profileData
          };
        } catch (error) {
          console.log('Diagnostik: Oväntat fel', error);
          return { 
            status: 'error', 
            message: 'Oväntat fel', 
            error,
            user,
            profile: null
          };
        }
      },
    }),
    {
      name: 'moi-sushi-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        profile: state.profile,
        isLoggedIn: state.isLoggedIn,
        isAdmin: state.isAdmin,
      }),
    }
  )
);