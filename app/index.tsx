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

  // Redirect based on user rolae
  if (!user) {
    return <Redirect href="/auth" />;
  }

  // Redirect admin users to admin panel
  if (user.role === 'admin') {
    return <Redirect href="/(admin)/" />;
  }

  // Redirect student/driver users to tabs
  return <Redirect href="/(tabs)/explore" />;
}
