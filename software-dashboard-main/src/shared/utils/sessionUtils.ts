// =============================================================================
// SESSION UTILS - Utilidades para manejo de estado de sesión
// Arquitectura de Software Profesional - Utilidades de Sesión
// =============================================================================

import { User } from '@/shared/types/common.types';

// =============================================================================
// SESSION STATUS - Estados de sesión
// =============================================================================

export type SessionStatus = 'active' | 'inactive' | 'recent' | 'old';

// =============================================================================
// SESSION CONFIG - Configuración de sesión
// =============================================================================

export const SESSION_CONFIG = {
  ACTIVE_THRESHOLD: 1 * 60 * 60 * 1000, // 24 horas en milisegundos
  RECENT_THRESHOLD: 1 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  OLD_THRESHOLD: 30 * 24 * 60 * 60 * 1000, // 30 días en milisegundos
} as const;

// =============================================================================
// SESSION UTILITIES - Funciones utilitarias
// =============================================================================

/**
 * Determina si un usuario tiene sesión activa
 * @param user - Usuario a evaluar
 * @param threshold - Umbral de tiempo en milisegundos (por defecto 24 horas)
 * @returns true si el usuario tiene sesión activa
 */
export const isUserSessionActive = (user: User, threshold: number = SESSION_CONFIG.ACTIVE_THRESHOLD): boolean => {
  if (!user.lastLoginAt) {
    return user.isActive; // Si no tiene lastLoginAt, usar isActive como fallback
  }
  
  const lastLogin = new Date(user.lastLoginAt);
  const now = new Date();
  const timeDiff = now.getTime() - lastLogin.getTime();
  
  return timeDiff <= threshold;
};

/**
 * Obtiene el estado de sesión de un usuario
 * @param user - Usuario a evaluar
 * @returns Estado de sesión del usuario
 */
export const getUserSessionStatus = (user: User): SessionStatus => {
  if (!user.lastLoginAt) {
    return user.isActive ? 'active' : 'inactive';
  }
  
  const lastLogin = new Date(user.lastLoginAt);
  const now = new Date();
  const timeDiff = now.getTime() - lastLogin.getTime();
  
  if (timeDiff <= SESSION_CONFIG.ACTIVE_THRESHOLD) {
    return 'active';
  } else if (timeDiff <= SESSION_CONFIG.RECENT_THRESHOLD) {
    return 'recent';
  } else if (timeDiff <= SESSION_CONFIG.OLD_THRESHOLD) {
    return 'old';
  } else {
    return 'inactive';
  }
};

/**
 * Formatea el tiempo transcurrido desde el último login
 * @param lastLoginAt - Fecha del último login
 * @returns String formateado del tiempo transcurrido
 */
export const formatLastLoginTime = (lastLoginAt?: Date): string => {
  if (!lastLoginAt) {
    return 'Nunca';
  }
  
  const now = new Date();
  const timeDiff = now.getTime() - lastLoginAt.getTime();
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Hace un momento';
  }
};

/**
 * Obtiene el color del badge según el estado de sesión
 * @param status - Estado de sesión
 * @returns Variante de color para el badge
 */
export const getSessionStatusColor = (status: SessionStatus): 'success' | 'warning' | 'danger' | 'secondary' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'recent':
      return 'warning';
    case 'old':
      return 'secondary';
    case 'inactive':
    default:
      return 'danger';
  }
};

/**
 * Obtiene el texto descriptivo del estado de sesión
 * @param status - Estado de sesión
 * @returns Texto descriptivo
 */
export const getSessionStatusText = (status: SessionStatus): string => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'recent':
      return 'Reciente';
    case 'old':
      return 'Antiguo';
    case 'inactive':
      return 'Inactivo';
    default:
      return 'Desconocido';
  }
};

/**
 * Calcula estadísticas de sesión para un grupo de usuarios
 * @param users - Lista de usuarios
 * @returns Estadísticas de sesión
 */
export const calculateSessionStats = (users: User[]) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => isUserSessionActive(user)).length;
  const inactiveUsers = totalUsers - activeUsers;
  
  // Usuarios por estado de sesión
  const sessionStatusCounts = users.reduce((acc, user) => {
    const status = getUserSessionStatus(user);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<SessionStatus, number>);
  
  return {
    total: totalUsers,
    active: activeUsers,
    inactive: inactiveUsers,
    byStatus: sessionStatusCounts,
    activePercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
  };
}; 