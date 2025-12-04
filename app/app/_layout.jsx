import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated, appLoading, user } = useAuth();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (!appLoading && fontsLoaded) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        if (user?.role === 'admin') {
          router.replace('/admin/');
        } else {
          router.replace('/user/');
        }
      }
    }
  }, [isAuthenticated, appLoading, user, fontsLoaded]);

  if (appLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#2d4d31" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}