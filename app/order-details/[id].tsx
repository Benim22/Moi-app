import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { useOrdersStore } from '@/store/orders-store';
import { MapPin, Phone, Calendar, Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getOrderById } = useOrdersStore();
  
  const order = getOrderById(id as string);
  
  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen 
          options={{
            headerShown: false
          }}
        />
        
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>
            Ordern kunde inte hittas
          </Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>Tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: sv,
      });
    } catch (error) {
      return dateString;
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', {
        locale: sv,
      });
    } catch (error) {
      return '';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Väntande';
      case 'processing':
        return 'Bearbetas';
      case 'completed':
        return 'Slutförd';
      case 'cancelled':
        return 'Avbruten';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.gold;
      case 'processing':
        return '#3b82f6'; // Blue
      case 'completed':
        return '#10b981'; // Green
      case 'cancelled':
        return '#ef4444'; // Red
      default:
        return theme.colors.text;
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orderdetaljer</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(order.status) + '20' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(order.status) }
              ]}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={20} color={theme.colors.subtext} />
              <Text style={styles.infoText}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={20} color={theme.colors.subtext} />
              <Text style={styles.infoText}>
                {formatTime(order.createdAt)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={20} color={theme.colors.subtext} />
              <Text style={styles.infoText}>
                {order.deliveryAddress}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Phone size={20} color={theme.colors.subtext} />
              <Text style={styles.infoText}>
                {order.phone}
              </Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Beställda artiklar</Text>
          
          <View style={styles.itemsContainer}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.itemImage} 
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder} />
                )}
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price} kr</Text>
                  <Text style={styles.itemQuantity}>Antal: {item.quantity}</Text>
                </View>
                
                <Text style={styles.itemTotal}>
                  {item.price * item.quantity} kr
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delsumma</Text>
              <Text style={styles.summaryValue}>{order.totalPrice} kr</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Leveransavgift</Text>
              <Text style={styles.summaryValue}>0 kr</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Totalt</Text>
              <Text style={styles.totalValue}>{order.totalPrice} kr</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.reorderButton}
            onPress={() => router.push('/menu')}
          >
            <Text style={styles.reorderButtonText}>Beställ igen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  notFoundText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  actionButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  itemsContainer: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  orderItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gold,
    alignSelf: 'center',
  },
  summaryContainer: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
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
  reorderButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  reorderButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});