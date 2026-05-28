import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading screen
  }

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
}
