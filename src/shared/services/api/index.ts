// Barrel export para todas las APIs del sistema
// Infraestructura de API
export { apiClient, client, MockApiClient } from './client';
export type { ApiResponse, ApiError } from './client';

// APIs de autenticación
export * from './auth/authApi';

// APIs de dominio
export * from './incidents/incidentsApi';
export * from './requirements/requirementsApi';
export * from './dashboard/dashboardApi';

// APIs de configuración
export * from './config/configApi';

// APIs de notificaciones
export * from './notifications/notificationsApi';

// APIs de reportes
export * from './reports/reportsApi'; 