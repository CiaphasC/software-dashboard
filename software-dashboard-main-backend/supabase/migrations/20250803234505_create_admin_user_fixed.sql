/* ===============================================================
   MIGRATION: Crear usuario administrador con Edge Function
   Fecha:     2025-08-04
   Autor:     Sistema de Gestión
   =============================================================== */

-- 0️⃣  Asegúrate de que la extensión pg_net existe
CREATE EXTENSION IF NOT EXISTS pg_net;

/*
-------------------------------------------------------------------------------
 BLOQUE PL/pgSQL
-------------------------------------------------------------------------------
• No usamos COMMIT dentro del bloque (no está permitido).
• Solo agendamos la petición HTTP; pg_net la enviará al cerrarse la migración.
*/
DO
$$
DECLARE
  ----------------------------------------------------------------
  --  CONFIGURACIÓN
  ----------------------------------------------------------------
  supabase_url text := coalesce(
    current_setting('app.settings.supabase_url',  true),
    'http://host.docker.internal:54321'           -- <- gateway local
  );

  supabase_anon_key text := coalesce(
    current_setting('app.settings.supabase_anon_key', true),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
    'eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.'
    'CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'  -- ← tu anon key real
  );

  request_id bigint;   -- ID que devuelve pg_net
BEGIN
  ----------------------------------------------------------------
  -- 1️⃣  Salir si ya existe un administrador activo
  ----------------------------------------------------------------
  IF EXISTS (
        SELECT 1
          FROM public.profiles  p
          JOIN public.roles     r ON p.role_id = r.id
         WHERE r.name      = 'admin'
           AND p.is_active = true
  ) THEN
    RAISE NOTICE '✅ Ya existe un administrador activo. Nada que hacer.';
    RETURN;
  END IF;

  ----------------------------------------------------------------
  -- 2️⃣  Programar la llamada a la Edge Function
  ----------------------------------------------------------------
  request_id := net.http_post(
      url     := supabase_url || '/functions/v1/create-admin-user-ts',
      body    := '{}'::jsonb,
      headers := jsonb_build_object(
                   'Content-Type', 'application/json',
                   'Authorization', 'Bearer ' || supabase_anon_key,
                   'apikey',        supabase_anon_key
                 )
  );

  RAISE NOTICE '🚀 Edge Function programada (request_id = %).', request_id;
  -- La petición se enviará al terminar la migración; no bloqueamos la ejecución.
END;
$$;
