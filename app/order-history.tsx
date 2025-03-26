import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  StatusBar,
  Pressable,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/user-store';
import { supabase } from '@/lib/supabase';
import { Package, ChevronRight, Trash2 } from 'lucide-react-native';
import BackButton from '@/components/BackButton';
import { useOrdersStore, Order } from '@/store/orders-store';
import Footer from '@/components/Footer';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { user, isAdmin } = useUserStore();
  const { deleteOrder, fetchOrders: storesFetchOrders, orders: storeOrders, isLoading: storeIsLoading } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    console.log("OrderHistoryScreen mounted, isAdmin:", isAdmin);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders directly from Supabase, user is admin:", isAdmin);
      setIsLoading(true);
      
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (!isAdmin && user?.id) {
        console.log("Filtering orders by user ID:", user.id);
        query = query.eq('user_id', user.id);
      } else {
        console.log("Admin user, fetching all orders");
      }
      
      const { data: ordersData, error: ordersError } = await query;
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        throw ordersError;
      }
      
      console.log(`Fetched ${ordersData?.length || 0} orders`);
      
      const fetchedOrders: Order[] = [];
      
      for (const order of ordersData || []) {
        console.log(`Fetching items for order ${order.id}`);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          continue;
        }
        
        const orderItems = itemsData?.map(item => ({
          id: item.id,
          menuItemId: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })) || [];
        
        fetchedOrders.push({
          id: order.id,
          userId: order.user_id,
          status: order.status,
          totalPrice: order.total_price,
          deliveryAddress: order.delivery_address || '',
          phone: order.phone || '',
          email: order.email || '',
          name: order.name || '',
          createdAt: order.created_at,
          items: orderItems,
        });
      }
      
      console.log("Setting local orders state with fetched orders");
      // Uppdatera lokal state för att visa ordrar
      setOrders(fetchedOrders);
      
      // Uppdatera även i store för konsistens
      useOrdersStore.setState({ orders: fetchedOrders });
      
    } catch (error) {
      console.log('Error fetching orders:', error);
      Alert.alert('Fel', 'Kunde inte hämta ordrar. Försök igen senare.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE') + ' ' + 
      date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Slutförd';
      case 'pending':
        return 'Väntande';
      case 'cancelled':
        return 'Avbruten';
      case 'processing':
        return 'Bearbetas';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // Green
      case 'pending':
        return theme.colors.gold;
      case 'cancelled':
        return '#ef4444'; // Red
      case 'processing':
        return '#3b82f6'; // Blue
      default:
        return theme.colors.text;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    console.log('Attempting to delete order:', orderId);
    Alert.alert(
      'Ta bort order',
      'Är du säker på att du vill ta bort denna order? Detta kan inte ångras.',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              console.log('Börjar radera order:', orderId);

              // Radera först order_items
              const { error: itemsDeleteError } = await supabase
                .from('order_items')
                .delete()
                .eq('order_id', orderId);

              if (itemsDeleteError) {
                throw new Error(`Kunde inte radera orderartiklar: ${itemsDeleteError.message}`);
              }

              // Radera sedan själva ordern
              const { error: orderDeleteError } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

              if (orderDeleteError) {
                throw new Error(`Kunde inte radera ordern: ${orderDeleteError.message}`);
              }

              // Uppdatera UI direkt efter lyckad borttagning
              const updatedOrders = orders.filter(order => order.id !== orderId);
              setOrders(updatedOrders);
              
              // Uppdatera även global state
              useOrdersStore.setState(state => ({
                ...state,
                orders: state.orders.filter(order => order.id !== orderId)
              }));

              console.log('Order raderad framgångsrikt:', orderId);
              Alert.alert('Borttaget!', 'Ordern har raderats');
              
            } catch (error: any) {
              console.error('Fel vid radering av order:', error);
              Alert.alert('Fel', error?.message || 'Kunde inte ta bort ordern. Försök igen senare.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => router.push(`/order-details/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'pending' ? '#111' : '#fff' }
          ]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.orderItemsContainer}>
        {item.items && item.items.length > 0 ? (
          item.items.map((orderItem, index) => (
            <Text key={orderItem.id} style={styles.orderItemText} numberOfLines={1}>
              {orderItem.quantity}x {orderItem.name}
              {index < item.items.length - 1 ? ', ' : ''}
            </Text>
          ))
        ) : (
          <Text style={styles.orderItemText}>Inga artiklar hittades</Text>
        )}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalPrice}>{item.totalPrice} kr</Text>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>Visa detaljer</Text>
          <ChevronRight size={16} color={theme.colors.gold} />
        </View>
      </View>
      
      {isAdmin && (
        <View style={styles.adminControls}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              console.log('Delete button clicked for order:', item.id);
              handleDeleteOrder(item.id);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color="#fff" />
            <Text style={styles.deleteButtonText}>Ta bort</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const EmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Package size={64} color={theme.colors.gold} />
      <Text style={styles.emptyTitle}>Inga ordrar än</Text>
      <Text style={styles.emptyText}>
        Du har inte lagt några ordrar än. När du gör det kommer de att visas här.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen 
        options={{
          title: 'Orderhistorik',
          headerStyle: { backgroundColor: 'transparent' },
          headerTitleStyle: { color: theme.colors.text },
          headerTransparent: true,
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
      
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.gold} />
            <Text style={styles.loaderText}>Hämtar ordrar...</Text>
          </View>
        ) : orders.length === 0 ? (
          <ScrollView style={styles.scrollView}>
            <EmptyOrders />
            <Footer />
          </ScrollView>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.orderList}
            refreshing={isLoading}
            onRefresh={fetchOrders}
            ListFooterComponent={<Footer />}
            ListFooterComponentStyle={styles.footerContainer}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingTop: 80,
  },
  footerContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  orderList: {
    padding: 16,
    paddingTop: 80,
  },
  orderItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
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
  orderDate: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  orderItemsContainer: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gold,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: theme.colors.gold,
    marginRight: 4,
  },
  adminControls: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
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