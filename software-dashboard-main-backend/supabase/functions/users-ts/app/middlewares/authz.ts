// =============================================================================
// MIDDLEWARES: auth y authorize (RBAC)
// =============================================================================
// auth:      Resuelve el usuario autenticado a partir del token Bearer, y carga
//            su perfil desde la vista 'profiles_with_roles'. Bloquea cuentas
//            inactivas. Deja 'auth' en el contexto con { user, profile }.
// authorize: Valida que el rol del perfil tenga la capacidad declarada para la
//            ruta. Evita condicionales repetidos (if/else) usando un mapa CAN.
// =============================================================================
import type { Context, Next } from 'hono'
import { getAuthUser } from '@shared/auth.ts'

export type AppAuth = {
  user: { id: string; email?: string | null }
  profile: { id: string; role_name: string; is_active: boolean; name?: string | null; email?: string | null }
}

// Capacidades declarativas por rol (alineadas con role_name de la BD)(sin if/else repetidos)
// Nota: mantenemos sinónimos heredados por compatibilidad
const CAN: Record<string, ReadonlyArray<string>> = {
  // Roles principales del sistema
  admin:              ['users:list','users:get','users:create','users:update','users:delete'],
  technician:         ['users:list','users:get','users:update'],
  requester:          [],

  // Sinónimos/roles heredados mapeados a capacidades equivalentes
  platform_admin:     ['users:list','users:get','users:create','users:update','users:delete'],
  operations_admin:   ['users:list','users:get','users:create','users:update','users:delete'],
  service_admin:      ['users:list','users:get','users:create','users:update'],
  support_technician: ['users:list','users:get'],
}

export async function auth(c: Context, next: Next) {
  const supa = c.get('supa')
  const user = await getAuthUser(c.req.raw, supa) // 401 si token inválido

  const { data: profile, error } = await supa
    .from('profiles_with_roles')
    .select('id, role_name, is_active, name, email')
    .eq('id', user.id)
    .single()
  if (error || !profile) {
    return c.json({ type: 'about:blank', title: 'Forbidden', detail: 'Perfil no encontrado' }, 403)
  }
  if (!profile.is_active) {
    return c.json({ type: 'about:blank', title: 'Forbidden', detail: 'Cuenta inactiva' }, 403)
  }

  c.set('auth', { user, profile } as AppAuth)
  await next()
}

export const authorize = (capability: string) =>
  async (c: Context, next: Next) => {
    const auth = c.get('auth') as AppAuth | undefined
    if (!auth) return c.json({ type: 'about:blank', title: 'Unauthorized' }, 401)

    const role = auth.profile.role_name
    if (!(CAN[role] ?? []).includes(capability)) {
      return c.json({ type: 'about:blank', title: 'Forbidden', detail: `Requiere: ${capability}` }, 403)
    }
    await next()
  }