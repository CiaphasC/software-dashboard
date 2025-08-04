// =============================================================================
// DATE UTILS - Utilidades centralizadas para manejo de fechas
// Arquitectura de Software Profesional - Eliminación de Duplicación de Lógica
// =============================================================================

import { DateOrString } from '@/shared/types/common.types';
import { useSettingsStore } from '@/shared/store';

// =============================================================================
// CONSTANTS - Constantes para formateo de fechas
// =============================================================================

const LOCALE_CONFIG = {
  'es': 'es-PE',
  'en': 'en-US'
} as const;

const TIMEZONE_CONFIG = {
  'es': 'America/Lima',
  'en': 'UTC'
} as const;

const CURRENCY_CONFIG = {
  'PEN': { symbol: 'S/', precision: 2, separator: ',', decimal: '.' },
  'USD': { symbol: 'USD', precision: 2, separator: ',', decimal: '.' },
  'EUR': { symbol: '€', precision: 2, separator: ',', decimal: '.' }
} as const;

// =============================================================================
// HELPER FUNCTIONS - Funciones auxiliares
// =============================================================================

/**
 * Convierte una fecha a objeto Date de manera segura
 */
const toDate = (date: DateOrString): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

/**
 * Obtiene la configuración de formato según el idioma
 */
const getFormatConfig = (language: 'es' | 'en' = 'es') => {
  return {
    locale: LOCALE_CONFIG[language],
    timezone: TIMEZONE_CONFIG[language],
    currency: language === 'es' ? 'PEN' : 'USD'
  };
};

// =============================================================================
// DATE FORMATTING - Funciones de formateo de fechas
// =============================================================================

/**
 * Formatea una fecha en formato corto (dd/MM/yyyy)
 */
export const formatDate = (date: DateOrString, language: 'es' | 'en' = 'es'): string => {
  const dateObj = toDate(date);
  if (!dateObj) return 'Sin fecha';
  
  const config = getFormatConfig(language);
  
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: config.timezone
  }).format(dateObj);
};

/**
 * Formatea una fecha con hora (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date: DateOrString, language: 'es' | 'en' = 'es'): string => {
  const dateObj = toDate(date);
  if (!dateObj) return 'Sin fecha';
  
  const config = getFormatConfig(language);
  
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: config.timezone
  }).format(dateObj);
};

/**
 * Formatea una fecha en formato relativo (hace 2 horas, hace 3 días, etc.)
 */
export const formatRelative = (date: DateOrString, language: 'es' | 'en' = 'es'): string => {
  const dateObj = toDate(date);
  if (!dateObj) return 'Sin fecha';
  
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (language === 'es') {
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    return formatDate(dateObj, language);
  } else {
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    return formatDate(dateObj, language);
  }
};

/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD)
 */
export const formatISO = (date: DateOrString): string => {
  const dateObj = toDate(date);
  if (!dateObj) return '';
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Formatea una fecha en formato largo (lunes, 15 de enero de 2024)
 */
export const formatLongDate = (date: DateOrString, language: 'es' | 'en' = 'es'): string => {
  const dateObj = toDate(date);
  if (!dateObj) return 'Sin fecha';
  
  const config = getFormatConfig(language);
  
  return new Intl.DateTimeFormat(config.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: config.timezone
  }).format(dateObj);
};

// =============================================================================
// DATE VALIDATION - Funciones de validación de fechas
// =============================================================================

/**
 * Valida si una fecha es válida
 */
export const isValidDate = (date: DateOrString): boolean => {
  const dateObj = toDate(date);
  return dateObj !== null;
};

/**
 * Verifica si una fecha está en el pasado
 */
export const isPastDate = (date: DateOrString): boolean => {
  const dateObj = toDate(date);
  if (!dateObj) return false;
  return dateObj < new Date();
};

/**
 * Verifica si una fecha está en el futuro
 */
export const isFutureDate = (date: DateOrString): boolean => {
  const dateObj = toDate(date);
  if (!dateObj) return false;
  return dateObj > new Date();
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: DateOrString): boolean => {
  const dateObj = toDate(date);
  if (!dateObj) return false;
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// =============================================================================
// DATE MANIPULATION - Funciones de manipulación de fechas
// =============================================================================

/**
 * Agrega días a una fecha
 */
export const addDays = (date: DateOrString, days: number): Date => {
  const dateObj = toDate(date) || new Date();
  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Resta días a una fecha
 */
export const subtractDays = (date: DateOrString, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Obtiene el primer día del mes
 */
export const getFirstDayOfMonth = (date: DateOrString): Date => {
  const dateObj = toDate(date) || new Date();
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

/**
 * Obtiene el último día del mes
 */
export const getLastDayOfMonth = (date: DateOrString): Date => {
  const dateObj = toDate(date) || new Date();
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

// =============================================================================
// HOOK PARA USAR CON CONFIGURACIÓN DEL STORE
// =============================================================================

/**
 * Hook que proporciona funciones de formateo con configuración del store
 */
export const useDateUtils = () => {
  const { config } = useSettingsStore();
  const language = config.general.language as 'es' | 'en';
  
  return {
    formatDate: (date: DateOrString) => formatDate(date, language),
    formatDateTime: (date: DateOrString) => formatDateTime(date, language),
    formatRelative: (date: DateOrString) => formatRelative(date, language),
    formatLongDate: (date: DateOrString) => formatLongDate(date, language),
    formatISO,
    isValidDate,
    isPastDate,
    isFutureDate,
    isToday,
    addDays,
    subtractDays,
    getFirstDayOfMonth,
    getLastDayOfMonth,
    language,
    timezone: config.general.timezone
  };
};

// =============================================================================
// EXPORT DEFAULT - Exportación por defecto
// =============================================================================

export default {
  formatDate,
  formatDateTime,
  formatRelative,
  formatLongDate,
  formatISO,
  isValidDate,
  isPastDate,
  isFutureDate,
  isToday,
  addDays,
  subtractDays,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  useDateUtils
}; 