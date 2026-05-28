import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
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

  // 3. Email/password users must verify their email before accessing the app
  if (!user.isAnonymous && user.provider === 'email' && !user.emailVerified) {
    return <Redirect href="/auth" />;
  }

  // 4. For web, hide the tab bar since navigation is in the page headers
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide bottom tab bar on web
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
