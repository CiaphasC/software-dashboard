// =============================================================================
// SUPABASE SERVICES INDEX - Índice principal de servicios de Supabase
// =============================================================================

export { supabase, connectionManager, realtimeManager, edgeFunctions } from './client'

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

export { authService, AuthService } from './auth'
export type { AuthUser, LoginCredentials, RegisterData, CreateUserData, UpdateUserData } from './auth'

export { dataService, DataService } from './data'
export type { IncidentFilters, RequirementFilters, DashboardMetrics } from './data'

export { edgeFunctionsService, EdgeFunctionsService } from './edgeFunctionsService'
export type {
  EdgeFunctionResponse,
  CreateIncidentData,
  UpdateIncidentData,
  CreateRequirementData,
  UpdateRequirementData
} from './edgeFunctionsService' 