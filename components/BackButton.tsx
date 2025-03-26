import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type BackButtonProps = {
  title?: string;
  color?: string;
  size?: number;
  onPress?: () => void;
  style?: any;
  variant?: 'default' | 'header' | 'outline' | 'text' | 'gold';
};

export default function BackButton({ 
  title, 
  color = theme.colors.text, 
  size = 24, 
  onPress,
  style,
  variant = 'default'
}: BackButtonProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };
  
  const getButtonColor = () => {
    if (variant === 'gold') {
      return theme.colors.gold;
    }
    return color;
  };
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'header':
        return styles.headerVariant;
      case 'outline':
        return styles.outlineVariant;
      case 'text':
        return styles.textVariant;
      default:
        return styles.defaultVariant;
    }
  };
  
  return (
    <Pressable 
      style={[
        styles.container, 
        variant === 'gold' && styles.goldContainer,
        getVariantStyle(),
        !title && styles.iconOnlyContainer,
        style
      ]} 
      onPress={handlePress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <View style={styles.buttonContent}>
        <ArrowLeft size={size} color={variant === 'gold' ? '#111' : getButtonColor()} />
        {title && (
          <Text style={[
            styles.title, 
            { color: variant === 'gold' ? '#111' : getButtonColor() }
          ]}>
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  defaultVariant: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerVariant: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineVariant: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  textVariant: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0,
  },
  goldContainer: {
    backgroundColor: theme.colors.gold,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOnlyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
}); 