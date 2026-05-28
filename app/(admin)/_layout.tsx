import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
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

  // 3. If user is student or driver, redirect to tabs
  if (user.role === 'student' || user.role === 'driver') {
    return <Redirect href="/(tabs)/" />;
  }

  // 4. If user is admin, render the admin Stack navigator
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F56476',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="students" 
        options={{ 
          title: 'Students',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="drivers" 
        options={{ 
          title: 'Drivers',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="user-detail" 
        options={{ 
          title: 'User Details',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
