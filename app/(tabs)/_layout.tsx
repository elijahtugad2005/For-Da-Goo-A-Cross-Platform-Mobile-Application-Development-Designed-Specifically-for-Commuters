import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

// Custom components
import { CustomTabBar } from '@/components/custom-tab-bar';
import { useAuth } from '../../hooks/useAuth';

export default function TabLayout() {
  const { user, isLoading } = useAuth(); 

  // 1. While checking auth, show a loading spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#F56476" />
      </View>
    );
  }

  // 2. If no user is logged in, redirect to auth screen
  if (!user) {
    return <Redirect href="/auth" />;
  }

  // 3. If user is an admin, redirect to admin panel
  if (user.role === 'admin') {
    return <Redirect href="/(admin)/" />;
  }

  // 4. If user IS logged in (student or driver), show the tab bar with custom design
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: user.role === 'driver' ? 'My Route' : 'Tracking',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}