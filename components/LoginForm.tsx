import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, LogIn, UserPlus, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const { login, signUp, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Reset errors when switching modes
    setErrors({});
  }, [isLogin]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) newErrors.email = 'E-post krävs';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Ogiltig e-postadress';
    
    if (!password) newErrors.password = 'Lösenord krävs';
    else if (password.length < 6) newErrors.password = 'Lösenord måste vara minst 6 tecken';
    
    if (!isLogin && !name) newErrors.name = 'Namn krävs';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
        router.back();
      } else {
        const { error: signUpError, user } = await signUp(email, password, name);
        if (signUpError) throw signUpError;
        
        if (user) {
          Alert.alert(
            "Konto skapat",
            "Ditt konto har skapats! Kontrollera din e-post för verifieringslänk.",
            [{ text: "OK" }]
          );
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        "Fel",
        error.message || "Ett fel uppstod vid inloggning/registrering"
      );
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Fel', 'Vänligen ange din e-postadress');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      Alert.alert('Fel', 'Vänligen ange en giltig e-postadress');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'moisushi://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Återställning skickad',
        'Kontrollera din e-post för instruktioner om hur du återställer ditt lösenord.',
        [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
      );
      setResetEmail('');
    } catch (error: any) {
      Alert.alert('Fel', error.message || 'Ett fel uppstod vid återställning av lösenord');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Välkommen</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, isLogin && styles.selectedTab]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.tabText, isLogin && styles.selectedTabText]}>
            Logga in
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, !isLogin && styles.selectedTab]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={[styles.tabText, !isLogin && styles.selectedTabText]}>
            Registrera
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Namn</Text>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>
            <View style={[styles.inputWrapper, errors.name ? styles.inputError : null]}>
              <User size={20} color={theme.colors.subtext} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Ditt namn"
                placeholderTextColor={theme.colors.subtext}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>E-post</Text>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>
          <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
            <Mail size={20} color={theme.colors.subtext} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Din e-postadress"
              placeholderTextColor={theme.colors.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Lösenord</Text>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>
          <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
            <Lock size={20} color={theme.colors.subtext} style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Ditt lösenord"
              placeholderTextColor={theme.colors.subtext}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>
        
        {isLogin && (
          <Pressable 
            style={styles.forgotPassword}
            onPress={() => setShowForgotPassword(true)}
          >
            <Text style={styles.forgotPasswordText}>Glömt lösenord?</Text>
          </Pressable>
        )}
        
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.buttonText || "#fff"} />
          ) : (
            <View style={styles.buttonContent}>
              {isLogin ? (
                <LogIn size={20} color={theme.colors.buttonText || "#fff"} />
              ) : (
                <UserPlus size={20} color={theme.colors.buttonText || "#fff"} />
              )}
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Logga in' : 'Skapa konto'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Återställ lösenord</Text>
              <TouchableOpacity 
                onPress={() => setShowForgotPassword(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalText}>
              Ange din e-postadress så skickar vi instruktioner för att återställa ditt lösenord.
            </Text>

            <View style={styles.inputWrapper}>
              <Mail size={20} color={theme.colors.subtext} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Din e-postadress"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
                value={resetEmail}
                onChangeText={setResetEmail}
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleResetPassword}
                disabled={isResetting}
              >
                {isResetting ? (
                  <ActivityIndicator color={theme.colors.buttonText || "#fff"} />
                ) : (
                  <Text style={styles.submitButtonText}>Skicka återställningslänk</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    padding: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedTab: {
    backgroundColor: theme.colors.gold,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedTabText: {
    color: theme.colors.background,
  },
  formContainer: {
    padding: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error || '#ff3b30',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkCard || theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputError: {
    borderColor: theme.colors.error || '#ff3b30',
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalButtonContainer: {
    marginTop: theme.spacing.lg,
  }
});