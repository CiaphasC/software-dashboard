// =============================================================================
// USE AUTH HOOK - Hook personalizado para autenticación
// Arquitectura de Software Profesional - Gestión de Estado de Autenticación
// =============================================================================

import { useAuthStore } from '@/shared/store';
import { useCallback, useEffect } from 'react';
import { authService } from '@/shared/services/supabase';

// =============================================================================
// USE AUTH HOOK - Hook principal
// =============================================================================

export const useAuth = () => {
  const auth = useAuthStore();

  // =============================================================================
  // SESSION INITIALIZATION - Inicialización de sesión
  // =============================================================================

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Verificar si hay una sesión activa
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          auth.setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        auth.logout();
      }
    };

    initializeSession();
  }, []);

  // =============================================================================
  // LOGOUT HANDLER - Manejador de logout mejorado
  // =============================================================================

  const logout = useCallback(async () => {
    try {
      // Cerrar sesión en Supabase
      await authService.logout();
      
      // Limpiar estado local
      auth.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Limpiar estado local incluso si hay error
      auth.logout();
    }
  }, [auth]);

  // =============================================================================
  // SESSION VALIDATION - Validación de sesión
  // =============================================================================

  const isSessionValid = useCallback(() => {
    if (!auth.user || !auth.isAuthenticated) {
      return false;
    }

    // Verificar si la sesión ha expirado
    if (auth.sessionExpiry && new Date() > auth.sessionExpiry) {
      logout();
      return false;
    }

    return true;
  }, [auth.user, auth.isAuthenticated, auth.sessionExpiry, logout]);

  // =============================================================================
  // SESSION REFRESH - Refrescar sesión
  // =============================================================================

  const refreshSession = useCallback(async () => {
    try {
      await auth.refreshSession();
    } catch (error) {
      console.error('Error refreshing session:', error);
      logout();
    }
  }, [auth, logout]);

  // =============================================================================
  // AUTHENTICATION METHODS - Métodos de autenticación
  // =============================================================================

  const login = useCallback(async (email: string, password: string) => {
    try {
      await auth.login(email, password);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }, [auth]);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    department: string;
    requestedRole: string;
  }) => {
    try {
      await auth.register(userData);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }, [auth]);

  // =============================================================================
  // UTILITY METHODS - Métodos de utilidad
  // =============================================================================

  const hasRole = useCallback((role: string) => {
    return auth.user?.role === role;
  }, [auth.user]);

  const hasPermission = useCallback((permission: string) => {
    if (!auth.user) return false;
    
    // Lógica de permisos basada en roles
    switch (permission) {
      case 'admin':
        return auth.user.role === 'admin';
      case 'technician':
        return ['admin', 'technician'].includes(auth.user.role);
      case 'requester':
        return ['admin', 'technician', 'requester'].includes(auth.user.role);
      default:
        return false;
    }
  }, [auth.user]);

  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  const isTechnician = useCallback(() => {
    return hasRole('technician') || hasRole('admin');
  }, [hasRole]);

  // =============================================================================
  // RETURN - Retornar valores del hook
  // =============================================================================

  return {
    // Estado
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    pendingUsersCount: auth.pendingUsersCount,
    
    // Métodos de autenticación
    login,
    logout,
    register,
    
    // Métodos de sesión
    isSessionValid,
    refreshSession,
    
    // Métodos de utilidad
    hasRole,
    hasPermission,
    isAdmin,
    isTechnician,
    
    // Métodos de estado
    setError: auth.setError,
    clearError: auth.clearError,
    updatePendingUsersCount: auth.updatePendingUsersCount
  };
}; 