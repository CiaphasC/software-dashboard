import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fail } from './responses.ts'

export async function getAuthUser(req: Request, supabase: SupabaseClient) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) throw new Error('No autorizado')
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('Usuario no autenticado')
  return user
}

export async function ensureAdminOrTechnician(supabase: SupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role_name, is_active')
    .eq('id', userId)
    .single()
  if (error) throw new Error('Error obteniendo perfil')
  if (!profile?.is_active || !['admin', 'technician'].includes(profile.role_name)) {
    throw new Error('Acceso denegado')
  }
}


