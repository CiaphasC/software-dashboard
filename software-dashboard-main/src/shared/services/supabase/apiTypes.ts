// =============================================================================
// EDGE FUNCTIONS API CONTRACTS - Contratos tipados por función (Request/Response)
// =============================================================================

import type { IncidentWithTimes, RequirementWithTimes } from '@/shared/services/supabase/types'

// =============================================================================
// Incidents - get-incident-ts
// =============================================================================

export type IncidentsListFilters = Record<string, unknown>

export interface IncidentsListParams {
  page?: number
  limit?: number
  search?: string
  filters?: IncidentsListFilters
}

export interface GetIncidentsListRequest {
  action: 'list'
  params: IncidentsListParams
}

export interface GetIncidentsListResponse {
  items: IncidentWithTimes[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface IncidentMetricsRequest {
  action: 'metrics'
}

export interface IncidentMetricsResponse {
  totalIncidents: number
  openIncidents: number
  inProgressIncidents: number
  resolvedIncidents: number
  closedIncidents: number
}

// =============================================================================
// Requirements - get-requirement-ts
// =============================================================================

export type RequirementsListFilters = Record<string, unknown>

export interface RequirementsListParams {
  page?: number
  limit?: number
  search?: string
  filters?: RequirementsListFilters
}

export interface GetRequirementsListRequest {
  action: 'list'
  params: RequirementsListParams
}

export interface GetRequirementsListResponse {
  items: RequirementWithTimes[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface RequirementMetricsRequest {
  action: 'metrics'
}

export interface RequirementMetricsResponse {
  totalRequirements: number
  pendingRequirements: number
  inProgressRequirements: number
  completedRequirements: number
  deliveredRequirements: number
}

// =============================================================================
// Users - get-users-ts
// =============================================================================

export interface UsersListParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

export interface UserListItem {
  id: string
  name: string
  email: string
  role_name: string
  department_id: number | null
  is_active: boolean
}

export type GetUsersListResponse = UserListItem[]

