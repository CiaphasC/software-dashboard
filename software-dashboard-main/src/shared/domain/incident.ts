// =============================================================================
// DOMAIN TYPES - Tipos de dominio para Incidents
// =============================================================================

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | string
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical' | string
export type IncidentType = 'network' | 'hardware' | 'software' | 'other' | string

export interface IncidentDomain {
  id: string
  title: string
  description: string
  status: IncidentStatus
  priority: IncidentPriority
  type: IncidentType
  createdAt: string
  estimatedResolutionDate?: string | null
  affectedAreaName?: string | null
  creatorName?: string | null
  assigneeName?: string | null
  timeRemaining?: string | null
}

export interface IncidentMetricsDomain {
  totalIncidents: number
  openIncidents: number
  inProgressIncidents: number
  resolvedIncidents: number
  closedIncidents: number
}

export interface IncidentListResult<TItem = IncidentDomain> {
  items: TItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

