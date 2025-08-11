// =============================================================================
// EDGE FUNCTIONS TYPES - Tipos compartidos y contratos de funciones
// =============================================================================

// Contrato genérico de respuesta de Edge Function
export interface EdgeFnEnvelope<TData> {
  success: boolean
  data?: TData
  error?: string
  message?: string
}

// get-users-ts
export interface EdgeUser {
  id: string
  name: string
  email: string
  role_name: string
  department_id: number | null
  department_name?: string | null
  department_short_name?: string | null
  is_active?: boolean
  is_email_verified?: boolean
  created_at?: string
  updated_at?: string
  last_login_at?: string | null
  avatar_url?: string | null
}

export interface ListUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

export interface ListResult<TItem> {
  items: TItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// get-incident-ts
export interface ListIncidentsParams {
  page?: number
  limit?: number
  search?: string
  filters?: Record<string, unknown>
}

export interface IncidentMetrics {
  totalIncidents: number
  openIncidents: number
  inProgressIncidents: number
  resolvedIncidents: number
  closedIncidents: number
}

// get-requirement-ts
export interface ListRequirementsParams {
  page?: number
  limit?: number
  search?: string
  filters?: Record<string, unknown>
}

// get-item-details-ts
export type ItemType = 'incident' | 'requirement'

export interface ItemDetailsRequest {
  item_type: ItemType
  item_id: string
}

export type ItemDetails = Record<string, unknown>

// get-catalogs-ts
export interface CatalogDepartment { id: number; name: string; short_name: string; is_active: boolean }
export interface CatalogRole { id: number; name: string; description: string; is_active: boolean }
export interface CatalogsData { departments: CatalogDepartment[]; roles: CatalogRole[] }


