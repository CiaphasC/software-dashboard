// =============================================================================
// SUPABASE SERVICES INDEX - Índice principal de servicios de Supabase
// Arquitectura de Software Profesional - Exportaciones de Servicios
// =============================================================================

// =============================================================================
// CLIENT EXPORTS - Exportaciones del cliente
// =============================================================================

export { 
  supabase, 
  connectionManager, 
  realtimeManager, 
  edgeFunctions 
} from './client'

// =============================================================================
// TYPES EXPORTS - Exportaciones de tipos
// =============================================================================

export type {
  Database,
  Profile,
  Incident,
  Requirement,
  Department,
  Role,
  RegistrationRequest,
  Attachment,
  RecentActivity,
  Notification,
  Report,
  ProfileWithRole,
  IncidentWithUsers,
  RequirementWithUsers,
  ActivityWithUser,
  RegistrationRequestWithAdmin,
  IncidentWithTimes,
  RequirementWithTimes,
  Tables,
  Inserts,
  Updates,
  DatabaseError,
  ApiResponse,
  PaginationParams,
  SortParams,
  FilterParams,
  QueryParams
} from './types'

// =============================================================================
// AUTH SERVICE EXPORTS - Exportaciones del servicio de autenticación
// =============================================================================

export { 
  authService,
  AuthService 
} from './auth'

export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  CreateUserData,
  UpdateUserData
} from './auth'

// =============================================================================
// DATA SERVICE EXPORTS - Exportaciones del servicio de datos
// =============================================================================

export { 
  dataService,
  DataService 
} from './data'

export type {
  IncidentFilters,
  RequirementFilters,
  DashboardMetrics
} from './data' 