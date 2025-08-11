import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

// =============================================================================
// SERVICIO: UserService
// =============================================================================
// Propósito: Encapsular lógica reutilizable de dominio de usuarios, como
//            resolución de IDs y acceso a vistas enriquecidas, evitando
//            duplicación en controladores.
// =============================================================================
export class UserService {
  constructor(private readonly supa: SupabaseClient) {}

  // Resuelve el ID del rol por nombre (valida existencia)
  async findRoleIdByName(roleName: string): Promise<number> {
    const { data, error } = await this.supa.from('roles').select('id').eq('name', roleName).single()
    if (error || !data) throw new Error('Rol no válido')
    return data.id
  }

  // Resuelve el ID del departamento por short_name o name
  async findDepartmentId(identifier: string): Promise<number> {
    const byShort = await this.supa.from('departments').select('id').eq('short_name', identifier).maybeSingle()
    if (byShort.data) return byShort.data.id
    const byName = await this.supa.from('departments').select('id').eq('name', identifier).maybeSingle()
    if (byName.data) return byName.data.id
    throw new Error('Departamento no válido')
  }

  // Obtiene perfil enriquecido desde la vista con rol y departamento
  async getProfileWithRoles(id: string) {
    const { data, error } = await this.supa.from('profiles_with_roles').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  }
}