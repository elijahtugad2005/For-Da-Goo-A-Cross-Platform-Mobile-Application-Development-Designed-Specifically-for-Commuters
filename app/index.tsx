import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#F56476" />
      </View>
    );
  }

<<<<<<< HEAD
  // Redirect based on user role
  if (!user) {
    return <Redirect href="/auth" />;
  }

  // Redirect admin users to admin panel
  if (user.role === 'admin') {
    return <Redirect href="/(admin)/" />;
  }

  // Redirect student/driver users to tabs
  return <Redirect href="/(tabs)/explore" />;
=======
  return <Redirect href={user ? "/(tabs)/explore" : "/auth"} />;
>>>>>>> f436dee2145d0f9cf43231c3354d45f581522a8e
}
