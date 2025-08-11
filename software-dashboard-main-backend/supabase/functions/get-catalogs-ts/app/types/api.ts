import type { Department } from './department.ts'
import type { Role } from './role.ts'

/**
 * Respuesta API: Colección de departamentos
 */
export interface DepartmentsResponse {
  departments: Department[]
}

/**
 * Respuesta API: Colección de roles
 */
export interface RolesResponse {
  roles: Role[]
}


