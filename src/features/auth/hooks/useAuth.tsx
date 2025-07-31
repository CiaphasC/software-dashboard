import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthContextType, RegisterFormData } from '../types';
import { authApi } from '@/shared/services';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Actualizar conteo de usuarios pendientes cuando el usuario cambie
  useEffect(() => {
    if (user && user.role === 'admin') {
      updatePendingUsersCount();
    }
  }, [user]);

  const updatePendingUsersCount = async () => {
    try {
      const count = await authApi.getPendingUsersCount();
      setPendingUsersCount(count);
    } catch (error) {
      console.error('Error getting pending users count:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userData = await authApi.login(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizar conteo de usuarios pendientes si es admin
      if (userData.role === 'admin') {
        await updatePendingUsersCount();
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterFormData) => {
    try {
      await authApi.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        department: userData.department,
        requestedRole: userData.requestedRole
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setPendingUsersCount(0);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    pendingUsersCount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
