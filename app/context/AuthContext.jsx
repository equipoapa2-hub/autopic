import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { API_URL } from '../constants';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error loading stored auth:', error);
      } finally {
        setAppLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const checkPlatformCompatibility = (userRole) => {
    const isMobile = Platform.OS !== 'web';
    const isWeb = Platform.OS === 'web';
    
    if (userRole === 'admin' && isMobile) {
      return {
        compatible: false,
        message: 'Tu rol es ADMIN. Debes acceder desde la plataforma WEB.',
        requiredPlatform: 'WEB'
      };
    } else if (userRole === 'user' && isWeb) {
      return {
        compatible: false,
        message: 'Tu rol es USUARIO. Debes acceder desde la plataforma MÓVIL.',
        requiredPlatform: 'MÓVIL'
      };
    }
    
    return { compatible: true };
  };

  const login = async (email, password) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // const platformCheck = checkPlatformCompatibility(data.user.role);
      // if (!platformCheck.compatible) {
      //   throw new Error(platformCheck.message);
      // }

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  const value = {
    user,
    token,
    appLoading,
    actionLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};