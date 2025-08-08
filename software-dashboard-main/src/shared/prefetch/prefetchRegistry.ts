import { incidentsRepository } from '@/shared/repositories/IncidentsRepository'
import { requirementsRepository } from '@/shared/repositories/RequirementsRepository'
import { usersRepository } from '@/shared/repositories/UsersRepository'
import { fetchWithCache } from '@/shared/data/fetcher'

type IntentionKey =
  | 'incidents:firstPage'
  | 'incidents:metrics'
  | 'requirements:firstPage'
  | 'requirements:metrics'
  | 'users:firstPage'
  | 'users:metrics'

export const prefetchRegistry: Record<IntentionKey, () => Promise<any>> = {
  'incidents:firstPage': () => fetchWithCache('incidents:firstPage', () => incidentsRepository.list({ page: 1, limit: 20 })),
  'incidents:metrics'  : () => fetchWithCache('incidents:metrics', () => incidentsRepository.metrics()),
  'requirements:firstPage': () => fetchWithCache('requirements:firstPage', () => requirementsRepository.list({ page: 1, limit: 20 })),
  'requirements:metrics'  : () => fetchWithCache('requirements:metrics', () => requirementsRepository.metrics()),
  'users:firstPage': () => fetchWithCache('users:firstPage', () => usersRepository.list({ page: 1, limit: 20 })),
  'users:metrics'  : () => fetchWithCache('users:metrics', () => usersRepository.metrics()),
}

