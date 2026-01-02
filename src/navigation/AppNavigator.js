import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatsScreen from '../screens/StatsScreen';
import EditItemScreen from '../screens/EditItemScreen';
import AddStaffScreen from '../screens/AddStaffScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AdminStack = createStackNavigator();

function AdminDashboardStack() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="Dashboard" component={DashboardScreen} />
      <AdminStack.Screen name="Stats" component={StatsScreen} />
      <AdminStack.Screen name="EditItem" component={EditItemScreen} />
    </AdminStack.Navigator>
  );
}

const AdminTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color, size }) => {
      let iconName;
      if (route.name === 'Stok') iconName = 'cube';
      else if (route.name === 'Barang') iconName = 'add-circle';
      else if (route.name === 'Riwayat') iconName = 'time';
      else if (route.name === 'Karyawan') iconName = 'people';
      else if (route.name === 'Profil') iconName = 'person';
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#3b5998',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: { paddingBottom: 5, height: 60 }
  })}>
    <Tab.Screen name="Stok" component={AdminDashboardStack} />
    <Tab.Screen name="Barang" component={AddItemScreen} />
    <Tab.Screen name="Riwayat" component={HistoryScreen} />
    <Tab.Screen name="Karyawan" component={AddStaffScreen} /> 
    <Tab.Screen name="Profil" component={ProfileScreen} />
  </Tab.Navigator>
);

const StaffTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color, size }) => {
      let iconName;
      if (route.name === 'Stok') iconName = 'list';
      else if (route.name === 'Riwayat') iconName = 'time';
      else if (route.name === 'Profil') iconName = 'person';
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#3b5998',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: { paddingBottom: 5, height: 60 }
  })}>
    <Tab.Screen name="Stok" component={DashboardScreen} />
    <Tab.Screen name="Riwayat" component={HistoryScreen} />
    <Tab.Screen name="Profil" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { user, role } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminTabs} />
        ) : (
          <Stack.Screen name="StaffHome" component={StaffTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}