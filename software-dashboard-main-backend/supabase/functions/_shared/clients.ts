import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function createSupabaseServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  return createClient(supabaseUrl, serviceKey)
}

export function createSupabaseUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
}

// Aliases estilo "anonClient" / "adminClient" para funciones nuevas con import maps
export const adminClient = () => createSupabaseServiceClient()
export const anonClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  return createClient(supabaseUrl, anonKey)
}


