import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  ScrollView 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useCartStore } from '@/store/cart-store';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react-native';
import CartItem from '@/components/CartItem';
import BackButton from '@/components/BackButton';
import Footer from '@/components/Footer';

export default function CartScreen() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = () => {
    router.push('/checkout');
  };

  const confirmClearCart = () => {
    Alert.alert(
      "Töm varukorg",
      "Är du säker på att du vill ta bort alla varor från din varukorg?",
      [
        { text: "Avbryt", style: "cancel" },
        { 
          text: "Töm", 
          onPress: () => {
            clearCart();
          }, 
          style: "destructive" 
        }
      ]
    );
  };
  
  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <ShoppingBag size={80} color={theme.colors.subtext} />
      <Text style={styles.emptyText}>Din varukorg är tom</Text>
      <Text style={styles.emptySubtext}>
        Lägg till artiklar från menyn för att börja beställa
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => router.push('/menu')}
      >
        <Text style={styles.browseButtonText}>Bläddra i menyn</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delsumma</Text>
          <Text style={styles.summaryValue}>{getTotalPrice()} kr</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Leveransavgift</Text>
          <Text style={styles.summaryValue}>0 kr</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Totalt</Text>
          <Text style={styles.totalValue}>{getTotalPrice()} kr</Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            items.length === 0 && styles.disabledButton
          ]}
          onPress={handleCheckout}
          disabled={items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Till kassan</Text>
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Varukorg',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.text },
          headerShadowVisible: false,
          headerLeft: () => (
            <BackButton 
              title=""
              variant="gold"
              size={26}
              style={styles.headerBackButton}
            />
          ),
        }}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      ) : items.length === 0 ? (
        <ScrollView style={styles.scrollView}>
          <EmptyCart />
          <Footer />
        </ScrollView>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartItem item={item} />
          )}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <View>
              {renderFooter()}
              <Footer />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  browseButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding to account for the footer
  },
  footerContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gold,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  checkoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    opacity: 0.7,
  },
  headerBackButton: {
    backgroundColor: theme.colors.gold,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});