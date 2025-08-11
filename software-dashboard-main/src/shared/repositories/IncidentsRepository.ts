// =============================================================================
// INCIDENTS REPOSITORY - Abstracción de acceso a datos
// =============================================================================

import { edgeFunctionsService, dataService } from '@/shared/services/supabase'
import type { IncidentWithTimes as IncidentWithTimesBase } from '@/shared/services/supabase/types'
import type { IncidentDomain, IncidentListResult, IncidentMetricsDomain } from '@/shared/domain/incident'

type IncidentWithTimesExtended = IncidentWithTimesBase & {
  estimated_resolution_date?: string | null
  affected_area_name?: string | null
  creator_name?: string | null
  assignee_name?: string | null
  time_remaining?: string | null
}

function mapToDomain(i: IncidentWithTimesExtended): IncidentDomain {
  return {
    id: i.id,
    title: i.title,
    description: i.description ?? '',
    status: i.status,
    priority: i.priority,
    type: i.type,
    createdAt: i.created_at,
    estimatedResolutionDate: i.estimated_resolution_date ?? null,
    affectedAreaName: i.affected_area_name ?? null,
    creatorName: i.creator_name ?? null,
    assigneeName: i.assignee_name ?? null,
    timeRemaining: i.time_remaining ?? null,
  }
}

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
    const item = await edgeFunctionsService.getIncident(id)
    return item ? mapToDomain(item as any) : null
  }
}

export const incidentsRepository = new IncidentsRepository()

