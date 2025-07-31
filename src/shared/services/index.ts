// =============================================================================
// SERVICES INDEX - Índice de servicios compartidos
// Arquitectura de Software Profesional - Exportaciones centralizadas
// =============================================================================

// API Service - Servicio principal de conexión con la API
export { 
  apiService, 
  ApiService, 
  type ApiResponse, 
  type ApiError, 
  type ApiConfig, 
  type RequestOptions 
} from './api/ApiService';

// Legacy API Services - Servicios API existentes
export * from './api';

// Servicios reactivos centralizados
export { usersService } from './usersService';
export type { UsersState, UsersFilters, UsersStats } from './usersService';

// Data Services - Servicios de datos mock
export * from './data';

// =============================================================================
// HOOKS - Hooks relacionados con servicios
// =============================================================================

export { 
  useApiService, 
  useAutoRefreshApi, 
  useFormApi,
  type UseApiState,
  type UseApiOptions
} from '../hooks/useApiService'; 