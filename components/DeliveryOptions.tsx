import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { Truck, ShoppingBag } from 'lucide-react-native';

interface DeliveryOptionsProps {
  deliveryMethod: 'delivery' | 'pickup';
  onSelectMethod: (method: 'delivery' | 'pickup') => void;
}

export default function DeliveryOptions({ 
  deliveryMethod, 
  onSelectMethod 
}: DeliveryOptionsProps) {
  return (
    <View style={styles.container}>
      <Pressable 
        style={[
          styles.option, 
          deliveryMethod === 'delivery' && styles.activeOption
        ]}
        onPress={() => onSelectMethod('delivery')}
      >
        <Truck 
          size={20} 
          color={deliveryMethod === 'delivery' ? theme.colors.buttonText || theme.colors.background : theme.colors.text} 
        />
        <Text style={[
          styles.optionText,
          deliveryMethod === 'delivery' && styles.activeOptionText
        ]}>Leverans</Text>
      </Pressable>
      
      <Pressable 
        style={[
          styles.option, 
          deliveryMethod === 'pickup' && styles.activeOption
        ]}
        onPress={() => onSelectMethod('pickup')}
      >
        <ShoppingBag 
          size={20}
          color={deliveryMethod === 'pickup' ? theme.colors.buttonText || theme.colors.background : theme.colors.text} 
        />
        <Text style={[
          styles.optionText,
          deliveryMethod === 'pickup' && styles.activeOptionText
        ]}>Avhämtning</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    gap: 8,
  },
  activeOption: {
    backgroundColor: theme.colors.gold,
  },
  optionText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeOptionText: {
    color: theme.colors.buttonText || theme.colors.background,
  },
});