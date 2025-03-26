import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'expo-router';

export default function CartIcon() {
  // Förenkla logiken genom att bara använda en direkt prenumeration på items-arrayen
  const [itemCount, setItemCount] = useState(0);
  const items = useCartStore(state => state.items);
  const router = useRouter();

  // Uppdatera itemCount när items ändras
  useEffect(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
  }, [items]);

  const handlePress = () => {
    router.push('/cart');
  };

  return (
    <Pressable 
      style={styles.container} 
      onPress={handlePress}
    >
      <ShoppingBag size={24} color={theme.colors.gold} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.gold,
    borderRadius: 12,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
});