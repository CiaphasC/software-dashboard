// =============================================================================
// STORE PROVIDER - Proveedor centralizado de stores
// Arquitectura de Software Profesional - Gestión de Estado Global
// =============================================================================

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/shared/store/authStore';
import { useUsersStore } from '@/shared/store/usersStore';
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { useRequirementsStore } from '@/shared/store/requirementsStore';
import { useSettingsStore } from '@/shared/store/settingsStore';
import { AuthInitializer } from '@/shared/components/auth/AuthInitializer';
import { RefreshProvider } from '@/shared/hooks/useCentralizedRefresh.tsx';

// =============================================================================
// STORE CONTEXT - Contexto para los stores
// =============================================================================

interface StoreContextType {
  // Stores disponibles
  auth: ReturnType<typeof useAuthStore>;
  users: ReturnType<typeof useUsersStore>;
  incidents: ReturnType<typeof useIncidentsStore>;
  requirements: ReturnType<typeof useRequirementsStore>;
  settings: ReturnType<typeof useSettingsStore>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// =============================================================================
// STORE PROVIDER - Componente principal
// =============================================================================

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // =============================================================================
  // STORES - Inicialización de stores
  // =============================================================================

  const auth = useAuthStore();
  const users = useUsersStore();
  const incidents = useIncidentsStore();
  const requirements = useRequirementsStore();
  const settings = useSettingsStore();

  // =============================================================================
  // INITIALIZATION - Inicialización de datos
  // =============================================================================

  useEffect(() => {
    // Inicializar configuración y datos básicos
    settings.loadSettings();
    // Los usuarios se cargan cuando el usuario está autenticado
  }, []);

  useEffect(() => {
    // Cargar datos iniciales si el usuario está autenticado
    if (auth.isAuthenticated && auth.user) {
      // Cargar datos específicos según el rol (ligero)
      if (auth.user.role === 'admin') {
        auth.updatePendingUsersCount();
      }
      // Nota: la carga de usuarios/incidencias/requerimientos ocurre on-demand por ruta.
    }
  }, [auth.isAuthenticated, auth.user]);

  // =============================================================================
  // SESSION MANAGEMENT - Gestión de sesión
  // =============================================================================

  useEffect(() => {
    // Verificar expiración de sesión
    const checkSessionExpiry = async () => {
      if (auth.sessionExpiry && new Date() > auth.sessionExpiry) {
        await auth.logout();
      }
    };

    const interval = setInterval(checkSessionExpiry, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [auth.sessionExpiry]);

  // =============================================================================
  // CONTEXT VALUE - Valor del contexto
  // =============================================================================

  const contextValue: StoreContextType = {
    auth,
    users,
    incidents,
    requirements,
    settings
  };

  // =============================================================================
  // RENDER - Renderizado del provider
  // =============================================================================

  return (
    <StoreContext.Provider value={contextValue}>
      <AuthInitializer>
        <RefreshProvider
          stores={{
            auth,
            users,
            incidents,
            requirements,
            settings
          }}
        >
          {children}
        </RefreshProvider>
      </AuthInitializer>
    </StoreContext.Provider>
  );
};

// =============================================================================
// USE STORE HOOK - Hook para usar el store
// =============================================================================

export const useStore = () => {
  const context = useContext(StoreContext);
  
  if (!context) {
    throw new Error('useStore debe ser usado dentro de StoreProvider');
  }
  
  return context;
}; 