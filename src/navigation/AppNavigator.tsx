import React from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SHADOWS } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import QueueScreen from '../screens/QueueScreen';
import HistoryScreen from '../screens/HistoryScreen';
import InventoryScreen from '../screens/InventoryScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SuppliersScreen from '../screens/SuppliersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



// ───────────────────────────────────────────────────────────
// Home Tab Navigator (Home, Orders, Stock, Profile)
// ───────────────────────────────────────────────────────────
function HomeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 64,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Stock',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ───────────────────────────────────────────────────────────
// Queue Tab Navigator (Queue, History, Profile)
// ───────────────────────────────────────────────────────────
function QueueTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 64,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          tabBarLabel: 'Queue',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QueueProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ───────────────────────────────────────────────────────────
// Inventory Tab Navigator (Dashboard, Inventory, Suppliers, Settings)
// ───────────────────────────────────────────────────────────
function InventoryTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 64,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Suppliers"
        component={SuppliersScreen}
        options={{
          tabBarLabel: 'Suppliers',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InventorySettings"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ───────────────────────────────────────────────────────────
// Root Navigator - The main role-based switcher screen
// ───────────────────────────────────────────────────────────
function RoleSelectorScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <TouchableOpacity 
        style={{ position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}
        onPress={() => navigation.replace('Login')}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>Back to Login</Text>
      </TouchableOpacity>

      <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: COLORS.primaryUltraLight, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>

        <Ionicons name="leaf" size={40} color={COLORS.primary} />
      </View>
      <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 8 }}>Green Pharmacy</Text>
      <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 40, textAlign: 'center' }}>
        Select your workspace to continue
      </Text>

      {[
        { label: 'Pharmacist Dashboard', subtitle: 'Home, Orders, Stock & Profile', icon: 'home', screen: 'PharmacistTabs' },
        { label: 'Prescription Queue', subtitle: 'Queue, History & Profile', icon: 'list', screen: 'QueueTabs' },
        { label: 'Inventory Manager', subtitle: 'Dashboard, Inventory & Suppliers', icon: 'cube', screen: 'InventoryTabs' },
      ].map(item => (
        <View
          key={item.screen}
          style={{ width: '100%', backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
        >
          <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.primaryUltraLight, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>{item.label}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{item.subtitle}</Text>
          </View>
          <View
            style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
          >
            <Text
              style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}
              onPress={() => navigation.navigate(item.screen)}
            >
              Open
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ───────────────────────────────────────────────────────────
// Root Stack Navigator
// ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RoleSelector" component={RoleSelectorScreen} />
        <Stack.Screen name="PharmacistTabs" component={HomeTabNavigator} />
        <Stack.Screen name="QueueTabs" component={QueueTabNavigator} />
        <Stack.Screen name="InventoryTabs" component={InventoryTabNavigator} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

