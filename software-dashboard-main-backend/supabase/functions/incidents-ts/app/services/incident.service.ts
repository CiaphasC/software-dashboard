import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * IncidentService
 * - Utilidades de dominio para operaciones sobre incidencias
 * - Centraliza verificaciones y consultas reutilizables
 */
export class IncidentService {
  constructor(private readonly supa: SupabaseClient) {}

  /** Valida que el departamento exista por id */
  async ensureDepartmentExists(id: number) {
    const { data, error } = await this.supa.from('departments').select('id').eq('id', id).maybeSingle()
    if (error || !data) throw new Error('Departamento no existe')
  }

  /** Valida que el usuario asignado exista por id */
  async ensureAssigneeExists(userId: string) {
    const { data, error } = await this.supa.from('profiles').select('id').eq('id', userId).maybeSingle()
    if (error || !data) throw new Error('Usuario asignado no existe')
  }
}


