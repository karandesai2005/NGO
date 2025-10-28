import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Calendar, Home, Users, Bell } from 'lucide-react-native';

export default function TabLayout() {
  const { user } = useAuth();

  // Determine if the user is an Admin for cleaner conditional logic
  const isAdmin = user?.role === 'Admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#667EEA',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
          // The conditional href has been removed to make it always visible
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
          href: isAdmin ? '/admin' : null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notify',
          tabBarIcon: ({ size, color }) => <Bell size={size} color={color} />,
          href: isAdmin ? '/notifications' : null,
        }}
      />
    </Tabs>

  );
}