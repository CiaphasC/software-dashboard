// =============================================================================
// SETTINGS STORE - Store centralizado para configuración del sistema
// Arquitectura de Software Profesional - Gestión de Estado de Configuración
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SystemConfig } from '@/shared/types/common.types';

// =============================================================================
// SETTINGS STATE - Estado de configuración
// =============================================================================

export interface SettingsState {
  // Configuración del sistema
  config: SystemConfig;
  loading: boolean;
  error: string | null;
  
  // Estado de cambios
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

// =============================================================================
// SETTINGS ACTIONS - Acciones de configuración
// =============================================================================

export interface SettingsActions {
  // Gestión de configuración
  loadSettings: () => Promise<void>;
  saveSettings: (config: Partial<SystemConfig>) => Promise<void>;
  resetSettings: () => void;
  setConfig: (config: SystemConfig) => void;
  updateSection: (section: keyof SystemConfig, updates: Partial<SystemConfig[keyof SystemConfig]>) => void;
  resetConfig: () => void;
  
  // Actualización de configuración
  updateTheme: (theme: 'light' | 'dark' | 'auto') => void;
  updateLanguage: (language: 'es' | 'en') => void;
  updateNotifications: (notifications: SystemConfig['notifications']) => void;
  updateDashboard: (dashboard: SystemConfig['dashboard']) => void;
  updateSecurity: (security: SystemConfig['security']) => void;
  
  // Gestión de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

// =============================================================================
// DEFAULT CONFIG - Configuración por defecto
// =============================================================================

const defaultConfig: SystemConfig = {
  theme: 'light',
  language: 'es',
  appearance: {
    theme: 'light',
    colorScheme: 'light',
    fontSize: 'medium',
    dataView: 'grid',
    sidebarCollapsed: false,
    compactMode: false,
    animations: true,
  },
  general: {
    language: 'es',
    timezone: 'America/Lima',
    dateFormat: 'DD/MM/YYYY',
    currency: 'PEN',
    companyName: 'Mi Empresa',
    address: 'Av. Arequipa 1234, Lima 15001, Perú',
    phone: '+51 1 234-5678',
    website: 'https://www.empresa.pe',
    email: 'contacto@empresa.pe',
  },
  notifications: {
    email: true,
    push: true,
    desktop: true,
    emailNotifications: true,
    pushNotifications: true,
    incidentAlerts: true,
    requirementUpdates: true,
    weeklyReports: false,
    dailyDigest: false,
  },
  dashboard: {
    autoRefresh: true,
    refreshInterval: 30000,
    showCharts: true,
    showMetrics: true
  },
  security: {
    sessionTimeout: 3600,
    requireMFA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false
    },
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    requireSpecialChars: false,
    autoLogout: true,
  },
  system: {
    version: 'v2.1.0',
    maintenanceMode: false,
    lastUpdate: new Date(),
    databaseSize: '2.4 GB',
    backupFrequency: 'Diario',
  }
};

// =============================================================================
// SETTINGS STORE - Store completo de configuración
// =============================================================================

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      // =============================================================================
      // INITIAL STATE - Estado inicial
      // =============================================================================
      
      config: defaultConfig,
      loading: false,
      error: null,
      hasUnsavedChanges: false,
      isSaving: false,

      // =============================================================================
      // CONFIGURATION ACTIONS - Acciones de configuración
      // =============================================================================

      loadSettings: async () => {
        set({ loading: true, error: null });
        
        try {
          // TODO: Implementar llamada a API real
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ loading: false });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Error al cargar configuración'
          });
        }
      },

      saveSettings: async (newConfig) => {
        set({ isSaving: true, error: null });
        
        try {
          // TODO: Implementar llamada a API real
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const updatedConfig = { ...get().config, ...newConfig };
          set({
            config: updatedConfig,
            isSaving: false,
            hasUnsavedChanges: false
          });
        } catch (error) {
          set({
            isSaving: false,
            error: error instanceof Error ? error.message : 'Error al guardar configuración'
          });
          throw error;
        }
      },

      resetSettings: () => {
        set({
          config: defaultConfig,
          hasUnsavedChanges: false
        });
      },

      setConfig: (config) => {
        set({ config });
      },

      updateSection: (section, updates) => {
        const currentConfig = get().config;
        set({
          config: {
            ...currentConfig,
            [section]: { ...currentConfig[section], ...updates }
          },
          hasUnsavedChanges: true
        });
      },

      resetConfig: () => {
        set({ config: defaultConfig });
      },

      // =============================================================================
      // UPDATE ACTIONS - Acciones de actualización
      // =============================================================================

      updateTheme: (theme) => {
        const currentConfig = get().config;
        set({
          config: { ...currentConfig, theme },
          hasUnsavedChanges: true
        });
      },

      updateLanguage: (language) => {
        const currentConfig = get().config;
        set({
          config: { ...currentConfig, language },
          hasUnsavedChanges: true
        });
      },

      updateNotifications: (notifications) => {
        const currentConfig = get().config;
        set({
          config: { ...currentConfig, notifications },
          hasUnsavedChanges: true
        });
      },

      updateDashboard: (dashboard) => {
        const currentConfig = get().config;
        set({
          config: { ...currentConfig, dashboard },
          hasUnsavedChanges: true
        });
      },

      updateSecurity: (security) => {
        const currentConfig = get().config;
        set({
          config: { ...currentConfig, security },
          hasUnsavedChanges: true
        });
      },

      // =============================================================================
      // STATE MANAGEMENT ACTIONS - Acciones de gestión de estado
      // =============================================================================

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasUnsavedChanges: (hasChanges) => {
        set({ hasUnsavedChanges: hasChanges });
      }
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        config: state.config
      })
    }
  )
); 