// =============================================================================
// INCIDENTS REPOSITORY - Abstracción de acceso a datos
// =============================================================================

import { edgeFunctionsService, dataService } from '@/shared/services/supabase'
import type { IncidentWithTimes } from '@/shared/services/supabase/types'
import type { IncidentDomain, IncidentListResult, IncidentMetricsDomain } from '@/shared/domain/incident'

export interface IncidentQuery {
  page?: number
  limit?: number
  search?: string
  filters?: {
    status?: string
    priority?: string
    type?: string
    assignedTo?: string
    createdBy?: string
    department?: string
    dateFrom?: string
    dateTo?: string
  }
}

function mapToDomain(i: IncidentWithTimes): IncidentDomain {
  return {
    id: i.id,
    title: i.title,
    description: i.description ?? '',
    status: i.status,
    priority: i.priority,
    type: i.type,
    createdAt: i.created_at,
    estimatedResolutionDate: (i as any).estimated_resolution_date ?? null,
    affectedAreaName: (i as any).affected_area_name ?? null,
    creatorName: (i as any).creator_name ?? null,
  }
}

export class IncidentsRepository {
  async list(query: IncidentQuery = {}): Promise<IncidentListResult> {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const result = await edgeFunctionsService.listIncidents({
      page,
      limit,
      search: query.search,
      filters: query.filters
    })

    return {
      items: (result.items || []).map(mapToDomain),
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    }
  }

  async metrics(): Promise<IncidentMetricsDomain> {
    return edgeFunctionsService.getIncidentMetrics()
  }

  async get(id: string): Promise<IncidentDomain | null> {
    const item = await dataService.getIncident(id)
    return item ? mapToDomain(item) : null
  }
}

export const incidentsRepository = new IncidentsRepository()

