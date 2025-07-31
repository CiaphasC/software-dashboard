// Servicio de configuración del sistema - Extraído del api.ts monolítico
import { SystemConfig } from '@/shared/types/common.types';

// Configuración por defecto del sistema
const defaultConfig: SystemConfig = {
  general: {
    companyName: 'Empresa Tecnológica S.A.',
    timezone: 'America/Lima',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    currency: 'PEN',
    address: 'Av. Principal 123, Lima, Perú',
    phone: '+51 1 234-5678',
    website: 'https://www.empresa.com'
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    incidentAlerts: true,
    requirementUpdates: true,
    weeklyReports: true,
    dailyDigest: false,
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
    version: '1.0.0',
    lastUpdate: new Date(),
    databaseSize: '2.5 GB',
    backupFrequency: 'daily',
    maintenanceMode: false
  }
};

// Configuración actual del sistema
let currentConfig: SystemConfig = { ...defaultConfig };

export const configService = {
  // Obtener configuración completa
  async getConfig(): Promise<SystemConfig> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Cargar desde localStorage si existe
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      try {
        currentConfig = { ...defaultConfig, ...JSON.parse(savedConfig) };
      } catch (error) {
        console.warn('Error loading saved config, using default');
      }
    }
    
    return currentConfig;
  },

  // Actualizar configuración
  async updateConfig(updates: Partial<SystemConfig>): Promise<SystemConfig> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentConfig = { ...currentConfig, ...updates };
    
    // Guardar en localStorage
    localStorage.setItem('systemConfig', JSON.stringify(currentConfig));
    
    return currentConfig;
  },

  // Actualizar sección específica de configuración
  async updateSection<K extends keyof SystemConfig>(
    section: K, 
    value: Partial<SystemConfig[K]>
  ): Promise<SystemConfig> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    currentConfig[section] = { ...currentConfig[section], ...value };
    
    // Guardar en localStorage
    localStorage.setItem('systemConfig', JSON.stringify(currentConfig));
    
    return currentConfig;
  },

  // Restablecer configuración por defecto
  async resetConfig(): Promise<SystemConfig> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    currentConfig = { ...defaultConfig };
    
    // Limpiar localStorage
    localStorage.removeItem('systemConfig');
    
    return currentConfig;
  },

  // Obtener configuración específica
  async getSection<K extends keyof SystemConfig>(section: K): Promise<SystemConfig[K]> {
    const config = await this.getConfig();
    return config[section];
  },

  // Verificar si el sistema está en modo mantenimiento
  async isMaintenanceMode(): Promise<boolean> {
    const config = await this.getConfig();
    return config.system.maintenanceMode;
  },

  // Obtener información del sistema
  async getSystemInfo(): Promise<{
    version: string;
    lastUpdate: Date;
    databaseSize: string;
    backupFrequency: string;
  }> {
    const config = await this.getConfig();
    return config.system;
  },

  // Actualizar información del sistema
  async updateSystemInfo(updates: Partial<SystemConfig['system']>): Promise<SystemConfig['system']> {
    const updatedConfig = await this.updateSection('system', updates);
    return updatedConfig.system;
  }
}; 