import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useUserStore } from './user-store';
import { useCartStore } from './cart-store';
import { Platform } from 'react-native';

// Uppdaterad API_URL med plattformsspecifik hantering för att lösa nätverksproblem
const API_URL = Platform.select({
  // För Android-emulatorer används IP-adress för att komma åt host-datorns server
  android: 'http://192.168.1.131:3000/api',
  // För iOS-simulatorer och webb används samma IP
  ios: 'http://192.168.1.131:3000/api',
  // Om du testar på en fysisk enhet, använd din dators IP-adress
  default: 'http://192.168.1.131:3000/api'
});

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalPrice: number;
  items: OrderItem[];
  deliveryAddress: string;
  phone: string;
  email: string;
  name: string;
  createdAt: string;
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  placeOrder: (deliveryAddress: string, phone: string, email: string, name: string) => Promise<{ success: boolean, error?: any }>;
  fetchOrders: () => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrders: () => void;
  fetchAllOrders: () => Promise<void>;
  deleteOrder: (orderId: string) => Promise<{ success: boolean, error?: any }>;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,
      
      placeOrder: async (deliveryAddress: string, phone: string, email: string, name: string) => {
        const user = useUserStore.getState().user;
        if (!user) return { success: false, error: 'User not authenticated' };
        
        const cartItems = useCartStore.getState().items;
        if (cartItems.length === 0) return { success: false, error: 'Cart is empty' };
        
        const totalPrice = useCartStore.getState().getTotalPrice();
        
        set({ isLoading: true });
        
        try {
          // Create order in Supabase
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: user.id,
              status: 'pending',
              total_price: totalPrice,
              delivery_address: deliveryAddress,
              phone,
              email,
              name,
            })
            .select('*')
            .single();
          
          if (orderError) throw orderError;
          
          // Create order items
          const orderItems = cartItems.map(item => ({
            order_id: orderData.id,
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            price: item.menuItem.price,
            name: item.menuItem.name,
          }));
          
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
          
          if (itemsError) throw itemsError;
          
          // Add to local state
          const newOrder: Order = {
            id: orderData.id,
            userId: orderData.user_id,
            status: orderData.status,
            totalPrice: orderData.total_price,
            deliveryAddress: orderData.delivery_address,
            phone: orderData.phone,
            email: orderData.email,
            name: orderData.name,
            createdAt: orderData.created_at,
            items: cartItems.map(item => ({
              id: `${orderData.id}-${item.menuItem.id}`,
              menuItemId: item.menuItem.id,
              name: item.menuItem.name,
              price: item.menuItem.price,
              quantity: item.quantity,
              image: item.menuItem.image,
            })),
          };
          
          set((state) => ({
            orders: [newOrder, ...state.orders],
          }));
          
          // Send email notifications
          try {
            // Prepare order items for email
            const itemsList = cartItems.map(item => 
              `${item.quantity}x ${item.menuItem.name} - ${item.menuItem.price * item.quantity} kr`
            ).join('\n');
            
            console.log('Försöker skicka orderbekräftelse till:', email);
            console.log('API URL:', API_URL);
            
            // Testa först om servern är tillgänglig
            try {
              const statusResponse = await fetch(`${API_URL}/status`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                },
              });
              
              if (statusResponse.ok) {
                console.log('Server status check OK, proceeding with order confirmation email');
              } else {
                console.warn('Server status check failed:', await statusResponse.text());
                // Vi fortsätter ändå med email-försöket
              }
            } catch (statusError) {
              console.warn('Server status check error:', (statusError as Error).message);
              // Vi fortsätter ändå med email-försöket
            }
            
            const response = await fetch(`${API_URL}/email/order-confirmation`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customerEmail: email,
                customerName: name,
                orderDetails: itemsList,
                orderTotal: totalPrice,
                deliveryAddress,
                phone,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('E-postbekräftelse misslyckades, statuskod:', response.status, 'fel:', errorText);
              throw new Error(`Failed to send email: ${response.status} ${errorText}`);
            } else {
              console.log('E-postbekräftelse skickad framgångsrikt');
            }
          } catch (emailError) {
            console.error('Error sending order notification email:', emailError);
            // Don't fail the order if email fails
          }
          
          // Clear the cart
          useCartStore.getState().clearCart();
          
          return { success: true };
        } catch (error) {
          console.error('Error placing order:', error);
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchOrders: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;
        
        set({ isLoading: true });
        
        try {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (ordersError) throw ordersError;
          
          if (ordersData) {
            const orders: Order[] = [];
            
            for (const order of ordersData) {
              const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);
              
              if (itemsError) throw itemsError;
              
              const items: OrderItem[] = itemsData.map(item => ({
                id: item.id,
                menuItemId: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              }));
              
              orders.push({
                id: order.id,
                userId: order.user_id,
                status: order.status,
                totalPrice: order.total_price,
                deliveryAddress: order.delivery_address,
                phone: order.phone,
                email: order.email,
                name: order.name || '',
                createdAt: order.created_at,
                items,
              });
            }
            
            set({ orders });
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      getOrderById: (orderId: string) => {
        return get().orders.find(order => order.id === orderId);
      },
      
      clearOrders: () => {
        set({ orders: [] });
      },
      
      fetchAllOrders: async () => {
        set({ isLoading: true });
        
        try {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (ordersError) throw ordersError;
          
          if (ordersData) {
            const orders: Order[] = [];
            
            for (const order of ordersData) {
              const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);
              
              if (itemsError) throw itemsError;
              
              const items: OrderItem[] = itemsData ? itemsData.map(item => ({
                id: item.id,
                menuItemId: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })) : [];
              
              orders.push({
                id: order.id,
                userId: order.user_id,
                status: order.status,
                totalPrice: order.total_price,
                deliveryAddress: order.delivery_address,
                phone: order.phone,
                email: order.email,
                name: order.name || '',
                createdAt: order.created_at,
                items,
              });
            }
            
            set({ orders });
          }
        } catch (error) {
          console.error('Error fetching all orders:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteOrder: async (orderId: string) => {
        const user = useUserStore.getState().user;
        const isAdmin = useUserStore.getState().isAdmin;
        if (!user) return { success: false, error: 'User not authenticated' };
        
        set({ isLoading: true });
        
        try {
          // Om användaren är admin, kontrollera inte user_id
          let query = supabase
            .from('orders')
            .select('*')
            .eq('id', orderId);
          
          if (!isAdmin) {
            // Om inte admin, kontrollera att ordern tillhör användaren
            query = query.eq('user_id', user.id);
          }
          
          const { data: orderData, error: orderError } = await query.single();
          
          if (orderError) {
            if (orderError.code === 'PGRST116') {
              return { success: false, error: 'Order not found or you do not have permission to delete it' };
            }
            throw orderError;
          }
          
          // Först ta bort alla order_items
          const { error: itemsDeleteError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId);
          
          if (itemsDeleteError) throw itemsDeleteError;
          
          // Sedan ta bort själva ordern
          const { error: orderDeleteError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);
          
          if (orderDeleteError) throw orderDeleteError;
          
          // Uppdatera lokalt state
          set((state) => ({
            orders: state.orders.filter(order => order.id !== orderId),
          }));
          
          return { success: true };
        } catch (error) {
          console.error('Error deleting order:', error);
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'orders-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);