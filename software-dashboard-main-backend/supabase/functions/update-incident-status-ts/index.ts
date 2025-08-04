// supabase/functions/update-incident-status/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { incident_id, new_status, resolved_at } = await req.json()

    // Verificar permisos del usuario
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'technician'].includes(profile.role_name)) {
      throw new Error('Solo administradores y técnicos pueden cambiar estados')
    }

    // Actualizar estado usando la función de la base de datos
    const { data, error } = await supabase.rpc('update_incident_status', {
      p_incident_id: incident_id,
      p_new_status: new_status,
      p_resolved_at: resolved_at,
      p_user_id: user.id
    })

    if (error) throw error

    // Enviar notificación en tiempo real
    await supabase.channel('incidents')
      .send({
        type: 'broadcast',
        event: 'incident_status_updated',
        payload: { incident_id, new_status, updated_by: user.id }
      })

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})