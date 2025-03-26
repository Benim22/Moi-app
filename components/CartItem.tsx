import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useCartStore } from '@/store/cart-store';
import { theme } from '@/constants/theme';
import { Minus, Plus, Trash } from 'lucide-react-native';

type CartItemProps = {
  item: any; // Använd rätt typ från din cart-store
};

export default function CartItem({ item }: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();

  const handleIncrease = () => {
    increaseQuantity(item.id);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      decreaseQuantity(item.id);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.menuItem.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{item.menuItem.name}</Text>
        <Text style={styles.price}>{item.menuItem.price} kr</Text>
        
        <View style={styles.quantityContainer}>
          <Pressable 
            style={styles.quantityButton} 
            onPress={handleDecrease}
          >
            {item.quantity > 1 ? (
              <Minus size={18} color={theme.colors.text} />
            ) : (
              <Trash size={18} color={theme.colors.error} />
            )}
          </Pressable>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <Pressable 
            style={styles.quantityButton}
            onPress={handleIncrease}
          >
            <Plus size={18} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalPrice}>
          {item.menuItem.price * item.quantity} kr
        </Text>
        
        <Pressable 
          style={styles.removeButton}
          onPress={handleRemove}
        >
          <Trash size={20} color={theme.colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  totalContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
}); 