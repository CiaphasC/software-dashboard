// supabase/functions/upload-file/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { file, incident_id, requirement_id, user_id } = await req.json()

    // Validar que el usuario existe
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Generar nombre único para el archivo
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${user_id}/${fileName}`

    // Subir archivo a Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) throw uploadError

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(uploadData.path)

    // Registrar en base de datos
    const { data: attachment, error: dbError } = await supabase
      .from('attachments')
      .insert({
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        uploaded_by: user_id,
        incident_id,
        requirement_id
      })
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(JSON.stringify({ attachment }), {
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