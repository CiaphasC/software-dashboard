/**
 * Tipo de dominio: Rol (catálogo transversal)
 * - Representa roles de aplicación utilizados para autorización y flujos de UI
 */
export interface Role {
  id: number
  name: string
  description: string
  is_active: boolean
}


