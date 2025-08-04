// =============================================================================
// AUTH STORE - Store centralizado para autenticación
// Arquitectura de Software Profesional - Gestión de Estado de Autenticación
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type AuthUser } from '@/shared/services/supabase';

// =============================================================================
// AUTH STATE - Estado de autenticación
// =============================================================================

export interface AuthState {
  // Estado del usuario
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  
  // Usuarios pendientes
  pendingUsersCount: number;
  
  // Estado de la sesión
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
}

// =============================================================================
// AUTH ACTIONS - Acciones de autenticación
// =============================================================================

export interface AuthActions {
  // Autenticación
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    department: string;
    requestedRole: string;
  }) => Promise<void>;
  
  // Gestión de usuarios pendientes
  updatePendingUsersCount: () => Promise<void>;
  
  // Gestión de estado
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Verificación de sesión
  verifySession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// =============================================================================
// AUTH STORE - Store completo de autenticación
// =============================================================================

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // =============================================================================
      // INITIAL STATE - Estado inicial
      // =============================================================================
      
      user: null,
      loading: false,
      error: null,
      pendingUsersCount: 0,
      isAuthenticated: false,
      sessionExpiry: null,

      // =============================================================================
      // AUTHENTICATION ACTIONS - Acciones de autenticación
      // =============================================================================

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          const user = await authService.login({ email, password });
          const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
          
          set({
            user,
            isAuthenticated: true,
            sessionExpiry,
            loading: false,
            error: null
          });

          // Si es admin, cargar conteo de usuarios pendientes
          if (user.role === 'admin') {
            await get().updatePendingUsersCount();
          }
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error de autenticación'
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Llamar al servicio de autenticación para hacer logout
          await authService.logout();
        } catch (error) {
          console.error('Error en logout:', error);
        } finally {
          // Limpiar completamente el estado de autenticación
          set({
            user: null,
            isAuthenticated: false,
            sessionExpiry: null,
            pendingUsersCount: 0,
            error: null
          });
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        
        try {
          await authService.register(userData);
          set({ loading: false, error: null });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error en el registro'
          });
          throw error;
        }
      },

      // =============================================================================
      // PENDING USERS ACTIONS - Acciones de usuarios pendientes
      // =============================================================================

      updatePendingUsersCount: async () => {
        const { user } = get();
        if (user?.role !== 'admin') return;

        try {
          const count = await authService.getPendingRegistrationRequestsCount();
          set({ pendingUsersCount: count });
        } catch (error) {
          console.error('Error updating pending users count:', error);
        }
      },

      // =============================================================================
      // STATE MANAGEMENT ACTIONS - Acciones de gestión de estado
      // =============================================================================

      setUser: (user: AuthUser | null) => {
        set({
          user,
          isAuthenticated: !!user,
          sessionExpiry: user ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // =============================================================================
      // SESSION MANAGEMENT ACTIONS - Acciones de gestión de sesión
      // =============================================================================

      verifySession: async () => {
        const { user, sessionExpiry } = get();
        
        // Si no hay usuario, no hay sesión que verificar
        if (!user) {
          set({ isAuthenticated: false });
          return;
        }

        // Verificar si la sesión ha expirado
        if (sessionExpiry && new Date() > sessionExpiry) {
          get().logout();
          return;
        }

        // Verificar sesión con el servidor
        try {
          const isValid = await authService.verifySession();
          if (!isValid) {
            get().logout();
          }
        } catch (error) {
          get().logout();
        }
      },

      refreshSession: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            set({
              user: currentUser,
              sessionExpiry
            });
          } else {
            get().logout();
          }
        } catch (error) {
          get().logout();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry
      }) // ✅ Solo persistir datos necesarios
    }
  )
); 