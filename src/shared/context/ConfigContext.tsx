import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SystemConfig } from '@/shared/types/common.types';

export interface ConfigContextType {
  config: SystemConfig;
  setConfig: (config: SystemConfig) => void;
  updateSection: <K extends keyof SystemConfig>(section: K, value: Partial<SystemConfig[K]>) => void;
  resetConfig: () => void;
}

const defaultConfig: SystemConfig = {
  general: {
    companyName: 'Sistema de Gestión Perú',
    timezone: 'America/Lima',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    currency: 'PEN',
    address: 'Av. Arequipa 1234, Lima 15001, Perú',
    phone: '+51 1 234-5678',
    website: 'https://www.empresa.pe'
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    incidentAlerts: true,
    requirementUpdates: true,
    weeklyReports: false,
    dailyDigest: true,
    smsNotifications: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    autoLogout: true
  },
  appearance: {
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    colorScheme: 'blue',
    fontSize: 'medium'
  },
  system: {
    version: 'v1.0.0',
    lastUpdate: new Date('2024-12-15'),
    databaseSize: '2.5 GB',
    backupFrequency: 'Diario',
    maintenanceMode: false
  }
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<SystemConfig>(() => {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Restaurar fechas
      if (parsed.system && parsed.system.lastUpdate) {
        parsed.system.lastUpdate = new Date(parsed.system.lastUpdate);
      }
      return parsed;
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('app_config', JSON.stringify(config));
  }, [config]);

  const setConfig = (newConfig: SystemConfig) => {
    setConfigState(newConfig);
  };

  const updateSection = <K extends keyof SystemConfig>(section: K, value: Partial<SystemConfig[K]>) => {
    setConfigState((prev: SystemConfig) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...value
      }
    }));
  };

  const resetConfig = () => {
    setConfigState(defaultConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, updateSection, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig debe usarse dentro de un ConfigProvider');
  return ctx;
}; 
