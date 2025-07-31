// =============================================================================
// DATA SERVICES INDEX - Índice de servicios de datos
// Arquitectura de Software Profesional - Exportaciones de datos mock
// =============================================================================

// Importar todos los archivos JSON de datos
import dashboardData from './dashboard.json';
import incidentsData from './incidents.json';
import usersData from './users.json';
import requirementsData from './requirements.json';
import notificationsData from './notifications.json';
import reportsData from './reports.json';

// =============================================================================
// EXPORTS - Exportaciones de datos
// =============================================================================

export {
  dashboardData,
  incidentsData,
  usersData,
  requirementsData,
  notificationsData,
  reportsData
};

// =============================================================================
// DEFAULT EXPORT - Exportación por defecto
// =============================================================================

export default {
  dashboard: dashboardData,
  incidents: incidentsData,
  users: usersData,
  requirements: requirementsData,
  notifications: notificationsData,
  reports: reportsData
}; 