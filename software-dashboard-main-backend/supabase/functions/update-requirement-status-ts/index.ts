// supabase/functions/update-requirement-status/index.ts
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

    const { requirement_id, new_status, delivered_at } = await req.json()

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
    const { data, error } = await supabase.rpc('update_requirement_status', {
      p_requirement_id: requirement_id,
      p_new_status: new_status,
      p_delivered_at: delivered_at,
      p_user_id: user.id
    })

    if (error) throw error

    // Enviar notificación en tiempo real
    await supabase.channel('requirements')
      .send({
        type: 'broadcast',
        event: 'requirement_status_updated',
        payload: { requirement_id, new_status, updated_by: user.id }
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