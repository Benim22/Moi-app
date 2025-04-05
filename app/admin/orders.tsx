import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Eye, Clock, Check, X } from 'lucide-react-native';
import BackButton from '@/components/BackButton';
import { sendOrderStatusNotification } from '@/lib/notifications';

// Definiera OrderItem enligt tabellstrukturen i bilden
interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  name: string;
  created_at: string;
  image?: string;
}

// Definiera Order för att matcha orders-tabellen
interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_price: number;
  delivery_address: string;
  phone: string;
  email: string;
  name: string;
  created_at: string;
  items: OrderItem[];
}

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Hämta alla ordrar med tillhörande order_items
  const fetchAllOrders = async () => {
    setIsLoading(true);
    
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (ordersData) {
        const ordersWithItems: Order[] = [];
        
        for (const order of ordersData) {
          // Hämta order_items för varje order
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          
          if (itemsError) throw itemsError;
          
          // Lägg till ordern med dess items i listan
          ordersWithItems.push({
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total_price: order.total_price,
            delivery_address: order.delivery_address,
            phone: order.phone,
            email: order.email,
            name: order.name || '',
            created_at: order.created_at,
            items: itemsData || [],
          });
        }
        
        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Uppdatera orderstatus
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Hämta först order för att få user_id
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // Uppdatera status
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Skicka notifikation till användaren
      if (orderData?.user_id) {
        await sendOrderStatusNotification(orderData.user_id, orderId, newStatus);
      }
      
      // Uppdatera lokal state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = filterStatus 
    ? orders.filter(order => order.status === filterStatus)
    : orders;

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => router.push(`/order-details/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
        <View style={[
          styles.statusBadge,
          {
            backgroundColor: 
              item.status === 'completed' ? '#4ECDC4' :
              item.status === 'pending' ? '#FFE66D' : '#FF6B6B'
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'pending' ? '#111' : '#fff' }
          ]}>
            {item.status === 'completed' ? 'Slutförd' : 
             item.status === 'pending' ? 'Väntar' : 'Avbruten'}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString('sv-SE')} {' '}
          {new Date(item.created_at).toLocaleTimeString('sv-SE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
        <Text style={styles.orderPrice}>{item.total_price} kr</Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderCustomer}>{item.name || 'Namnlös kund'}</Text>
        {item.delivery_address && (
          <Text style={styles.orderAddress}>{item.delivery_address}</Text>
        )}
        {item.phone && (
          <Text style={styles.orderPhone}>{item.phone}</Text>
        )}
      </View>

      {/* Visa orderprodukter */}
      <View style={styles.orderItemsList}>
        <Text style={styles.orderItemsHeader}>Produkter:</Text>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Text style={styles.orderItemQuantity}>{orderItem.quantity}x</Text>
            <Text style={styles.orderItemName}>{orderItem.name}</Text>
            <Text style={styles.orderItemPrice}>{orderItem.price * orderItem.quantity} kr</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => router.push(`/order-details/${item.id}`)}
        >
          <Eye size={18} color={theme.colors.text} />
          <Text style={styles.actionButtonText}>Visa</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => updateOrderStatus(item.id, 'completed')}
            >
              <Check size={18} color="#fff" />
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>Slutför</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => updateOrderStatus(item.id, 'cancelled')}
            >
              <X size={18} color="#fff" />
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>Avbryt</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          title: 'Ordrar',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text },
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
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ordrar</Text>
          <Text style={styles.subtitle}>Hantera alla beställningar</Text>
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterStatus === null && styles.activeFilter
            ]}
            onPress={() => setFilterStatus(null)}
          >
            <Text style={[
              styles.filterText,
              filterStatus === null && styles.activeFilterText
            ]}>
              Alla
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterStatus === 'pending' && styles.activeFilter
            ]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[
              styles.filterText,
              filterStatus === 'pending' && styles.activeFilterText
            ]}>
              Väntande
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterStatus === 'completed' && styles.activeFilter
            ]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text style={[
              styles.filterText,
              filterStatus === 'completed' && styles.activeFilterText
            ]}>
              Slutförda
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterStatus === 'cancelled' && styles.activeFilter
            ]}
            onPress={() => setFilterStatus('cancelled')}
          >
            <Text style={[
              styles.filterText,
              filterStatus === 'cancelled' && styles.activeFilterText
            ]}>
              Avbrutna
            </Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.gold} />
            <Text style={styles.loadingText}>Laddar ordrar...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Inga {filterStatus ? filterStatus + ' ' : ''}ordrar att visa
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: theme.colors.gold,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  activeFilterText: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 16,
  },
  list: {
    paddingBottom: 24,
  },
  orderItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: theme.colors.text,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  orderDetails: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  orderCustomer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderPhone: {
    fontSize: 14,
    color: theme.colors.text,
  },
  orderItemsList: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  orderItemsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: theme.colors.text,
    width: '10%',
  },
  orderItemName: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    marginLeft: 8,
  },
  orderItemPrice: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: theme.colors.background,
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
    color: theme.colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text,
    marginTop: 24,
    fontSize: 16,
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