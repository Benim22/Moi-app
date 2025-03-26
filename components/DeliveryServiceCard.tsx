import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Linking } from 'react-native';
import { theme } from '@/constants/theme';
import { Clock, DollarSign, ExternalLink } from 'lucide-react-native';

interface DeliveryServiceProps {
  name: string;
  logo: string;
  time: string;
  price: string;
  url: string;
}

export default function DeliveryServiceCard({ 
  name, 
  logo, 
  time, 
  price, 
  url 
}: DeliveryServiceProps) {
  const handlePress = () => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: logo }} style={styles.logo} />
        <Text style={styles.name}>{name}</Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detail}>
          <Clock size={16} color={theme.colors.subtext} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        <View style={styles.detail}>
          <DollarSign size={16} color={theme.colors.subtext} />
          <Text style={styles.detailText}>{price}</Text>
        </View>
      </View>
      
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Beställ via {name}</Text>
        <ExternalLink size={16} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  details: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  detailText: {
    color: theme.colors.subtext,
    marginLeft: theme.spacing.xs,
  },
  button: {
    backgroundColor: theme.colors.darkCard || theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});