import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

function CustomDrawerContent(props) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={24} color="#d32f2f" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/login');
    }
  }, [isAuthenticated, user]);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#03624C',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#f9f9f9',
        },
        drawerActiveTintColor: '#03624C',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Inicio',
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          title: 'Usuarios',
          drawerLabel: 'Usuarios',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="vehicles"
        options={{
          title: 'Vehículos',
          drawerLabel: 'Vehículos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="vehicle-usage"
        options={{
          title: 'Uso de Vehículos',
          drawerLabel: 'Uso de Vehículos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="autopic-ia"
        options={{
          title: 'AutoPic IA',
          drawerLabel: 'AutoPic IA',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    fontFamily: 'Poppins-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});