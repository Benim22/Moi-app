import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '@/constants/theme';
import { Home, Utensils, Calendar, Info, User, Car, HelpCircle } from 'lucide-react-native';
import CartIcon from '@/components/CartIcon';
import { useUserStore } from '@/store/user-store';
import { View } from 'react-native';

export default function TabLayout() {
  const { isLoggedIn } = useUserStore();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.gold,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerShown: true,
        headerRight: () => (
          <View style={{ paddingRight: 16, paddingTop: 8 }}>
            <CartIcon />
          </View>
        ),
        headerTransparent: true,
        headerTitle: '',
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hem',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Meny',
          tabBarIcon: ({ color }) => <Utensils size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Boka',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Om oss',
          tabBarIcon: ({ color }) => <Info size={24} color={color} />,
        }}
      />
      
      
      <Tabs.Screen
        name="order"
        options={{
          title: 'Frakt',
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Hjälp',
          tabBarIcon: ({ color }) => <HelpCircle size={24} color={color} />,
        }}
      />
      
    </Tabs>
  );
}