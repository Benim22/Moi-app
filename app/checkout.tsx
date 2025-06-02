import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native';
import { globalStyles } from '@/constants/theme';
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react-native';
import BackButton from '@/components/BackButton';
import ScreenHeader from '@/components/ScreenHeader';

export default function CheckoutScreen() {
  const { items, getTotalPrice } = useCartStore();
  const { user, profile, isLoggedIn } = useUserStore();
  const { placeOrder, isLoading: storeIsLoading } = useOrdersStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<'restaurant'>('restaurant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    } else if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);
  
  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Inloggning krävs', 
        'Du måste vara inloggad för att beställa. Detta hjälper oss att förhindra falska beställningar.',
        [
          { text: 'Logga in', onPress: handleLogin },
          { text: 'Bli medlem', onPress: () => router.push('/login?tab=register') },
          { text: 'Avbryt', style: 'cancel' }
        ]
      );
      return;
    }
    
    if (!name || !email || !phone || !address) {
      Alert.alert('Fel', 'Vänligen fyll i alla obligatoriska fält');
      return;
    }
    
    if (items.length === 0) {
      Alert.alert('Fel', 'Din kundvagn är tom');
      return;
    }
    
    if (!name.trim()) {
      Alert.alert('Fel', 'Namnet får inte vara tomt');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { success, error } = await placeOrder(address, phone, email, name);
      
      if (success) {
        Alert.alert(
          'Beställning mottagen', 
          'Tack för din beställning! Vi har skickat en bekräftelse till din e-post.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                router.push('/order-history');
              } 
            }
          ]
        );
      } else {
        Alert.alert(
          'Fel',
          error?.message || 'Ett fel uppstod när din beställning skulle läggas'
        );
      }
    } catch (err) {
      console.error('Fel vid beställning:', err);
      Alert.alert(
        'Fel',
        'Ett oväntat fel inträffade. Försök igen senare.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const CustomBackButton = () => (
    <BackButton 
      title=""
      variant="gold"
      size={26}
      style={styles.headerBackButton}
    />
  );

  const HeaderTitle = () => (
    <View style={styles.headerTitleContainer}>
      <Image 
        source={{ uri: 'https://cdn.discordapp.com/attachments/1371111380865781861/1374028360203632660/Color_logo_-_no_background.png?ex=682c8f21&is=682b3da1&hm=b1eee096f04149550c56054a7d09286a46347bc5a7398146816fcd5fd7cc2e62&' }}
        style={styles.logoImage}
        onError={() => console.error('Kunde inte ladda logotypen')}
      />
      <Text style={styles.headerTitle}>Kassa</Text>
    </View>
  );

  return (
    <SafeAreaView style={[globalStyles.container, styles.safeArea]} edges={['bottom']}>
      
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {!isLoggedIn && (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                För att motverka falska beställningar måste du vara inloggad för att beställa mat.
              </Text>
              <View style={styles.loginButtonsContainer}>
                <Pressable style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Logga in</Text>
                </Pressable>
                <Pressable style={styles.registerButton} onPress={() => router.push('/login?tab=register')}>
                  <Text style={styles.registerButtonText}>Bli medlem</Text>
                </Pressable>
              </View>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leveransinformation</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Namn</Text>
              <TextInput
                style={[styles.input, !isLoggedIn && styles.disabledInput]}
                placeholder="Ditt namn"
                placeholderTextColor={theme.colors.subtext}
                value={name}
                onChangeText={setName}
                editable={isLoggedIn}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-post</Text>
              <TextInput
                style={[styles.input, !isLoggedIn && styles.disabledInput]}
                placeholder="Din e-postadress"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={isLoggedIn}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={[styles.input, !isLoggedIn && styles.disabledInput]}
                placeholder="Ditt telefonnummer"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={isLoggedIn}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Leveransadress</Text>
              <TextInput
                style={[styles.input, !isLoggedIn && styles.disabledInput]}
                placeholder="Din leveransadress"
                placeholderTextColor={theme.colors.subtext}
                value={address}
                onChangeText={setAddress}
                editable={isLoggedIn}
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Betalningsmetod</Text>
            
            <Pressable 
              style={[
                styles.paymentOption,
                paymentMethod === 'restaurant' && styles.selectedPaymentOption
              ]}
              onPress={() => setPaymentMethod('restaurant')}
            >
              <DollarSign size={24} color={theme.colors.text} />
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionTitle}>Betala i restaurangen</Text>
                <Text style={styles.paymentOptionDescription}>
                  Betala när du hämtar din beställning i restaurangen
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                paymentMethod === 'restaurant' && styles.radioButtonSelected
              ]}>
                {paymentMethod === 'restaurant' && <View style={styles.radioButtonInner} />}
              </View>
            </Pressable>
            
            <View style={styles.disabledPaymentContainer}>
              <View style={styles.disabledPaymentOption}>
                <Smartphone size={24} color={theme.colors.subtext} />
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.disabledPaymentTitle}>Swish</Text>
                  <Text style={styles.disabledPaymentDescription}>
                    Inte tillgängligt för tillfället
                  </Text>
                </View>
                <View style={styles.disabledRadioButton} />
              </View>
              
              <View style={styles.disabledPaymentOption}>
                <CreditCard size={24} color={theme.colors.subtext} />
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.disabledPaymentTitle}>Kort</Text>
                  <Text style={styles.disabledPaymentDescription}>
                    Inte tillgängligt för tillfället
                  </Text>
                </View>
                <View style={styles.disabledRadioButton} />
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Din beställning</Text>
            
            <View style={styles.orderSummary}>
              {items.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.orderItemName}>{item.menuItem.name}</Text>
                  <Text style={styles.orderItemPrice}>
                    {item.menuItem.price * item.quantity} kr
                  </Text>
                </View>
              ))}
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delsumma</Text>
                <Text style={styles.summaryValue}>{getTotalPrice()} kr</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Leveransavgift</Text>
                <Text style={styles.summaryValue}>0 kr</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Totalt</Text>
                <Text style={styles.totalValue}>{getTotalPrice()} kr</Text>
              </View>
            </View>
          </View>
          
          <Pressable 
            style={[
              styles.placeOrderButton,
              isSubmitting && styles.disabledButton
            ]} 
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
          >
            <Text style={styles.placeOrderButtonText}>
              {isSubmitting ? 'Bearbetar...' : 'Lägg beställning'}
            </Text>
          </Pressable>
          
          <Text style={styles.disclaimer}>
            Genom att lägga din beställning godkänner du våra köpvillkor och integritetspolicy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loginPrompt: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  loginButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  loginButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  loginButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.md,
  },
  registerButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabledInput: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    opacity: 0.6,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPaymentOption: {
    borderColor: theme.colors.gold,
  },
  paymentOptionContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.gold,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.gold,
  },
  disabledPaymentContainer: {
    opacity: 0.7,
  },
  disabledPaymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabledPaymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.subtext,
    marginBottom: 2,
  },
  disabledPaymentDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  disabledRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  orderSummary: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  orderItemQuantity: {
    width: 30,
    fontSize: 14,
    color: theme.colors.subtext,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  orderItemPrice: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
  },
  placeOrderButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  cartCount: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  headerBackButton: {
    marginLeft: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});