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
import { Mail, Lock, User, LogIn, UserPlus, X, CheckCircle, Circle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import PrivacyPolicyModal from './PrivacyPolicyModal';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  const { login, signUp, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Reset errors when switching modes
    setErrors({});
    
    // Reset privacy policy acceptance when switching modes
    if (isLogin) {
      setPrivacyPolicyAccepted(false);
    }
  }, [isLogin]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) newErrors.email = 'E-post krävs';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Ogiltig e-postadress';
    
    if (!password) newErrors.password = 'Lösenord krävs';
    else if (password.length < 6) newErrors.password = 'Lösenord måste vara minst 6 tecken';
    
    if (!isLogin && !name) newErrors.name = 'Namn krävs';
    
    if (!isLogin && !privacyPolicyAccepted) {
      newErrors.privacyPolicy = 'Du måste acceptera integritetspolicyn för att fortsätta';
    }
    
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
  
  const togglePrivacyPolicyAcceptance = () => {
    setPrivacyPolicyAccepted(!privacyPolicyAccepted);
    
    // Om det fanns ett felmeddelande, radera det när användaren kryssar i rutan
    if (errors.privacyPolicy) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.privacyPolicy;
        return newErrors;
      });
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
        
        {isLogin ? (
          <Pressable 
            style={styles.forgotPassword}
            onPress={() => setShowForgotPassword(true)}
          >
            <Text style={styles.forgotPasswordText}>Glömt lösenord?</Text>
          </Pressable>
        ) : (
          <View>
            <View style={styles.privacyPolicyContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={togglePrivacyPolicyAcceptance}
              >
                {privacyPolicyAccepted ? (
                  <CheckCircle size={24} color={theme.colors.gold} />
                ) : (
                  <Circle size={24} color={theme.colors.subtext} />
                )}
              </TouchableOpacity>
              <Text style={styles.privacyPolicyText}>
                Jag accepterar 
                <Text 
                  style={styles.privacyPolicyLink}
                  onPress={() => setShowPrivacyPolicy(true)}
                > integritetspolicyn
                </Text>
              </Text>
            </View>
            {errors.privacyPolicy && (
              <Text style={[styles.errorText, styles.privacyPolicyError]}>
                {errors.privacyPolicy}
              </Text>
            )}
          </View>
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
            
            <View style={styles.modalBody}>
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
              
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleResetPassword}
                disabled={isResetting}
              >
                {isResetting ? (
                  <ActivityIndicator color={theme.colors.buttonText || "#fff"} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Skicka återställningslänk
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTab: {
    borderBottomColor: theme.colors.gold,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.subtext,
  },
  selectedTabText: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 40,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: theme.colors.buttonText || '#000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: theme.colors.gold,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#e53935',
    fontSize: 12,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e53935',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
  },
  privacyPolicyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  privacyPolicyText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  privacyPolicyLink: {
    color: theme.colors.gold,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  privacyPolicyError: {
    marginTop: -16,
    marginBottom: 16,
  },
});