/* ===============================================================
   MIGRATION: Insertar datos de requerimientos de ejemplo
   fecha:   2025-08-03
   autor:   Sistema de Gestión
   =============================================================== */

-- Insertar datos de requerimientos de ejemplo
DO $$
DECLARE
  -- IDs de departamentos
  contabilidad_dept_id bigint;
  marketing_dept_id bigint;
  gerencia_dept_id bigint;
  rrhh_dept_id bigint;
  logistica_dept_id bigint;
  ti_dept_id bigint;
  ventas_dept_id bigint;
  
  -- IDs de usuarios
  admin_user_id uuid;
  tecnico_user_id uuid;
  solicitante_user_id uuid;
BEGIN
  -- Obtener IDs de departamentos
  SELECT id INTO contabilidad_dept_id FROM public.departments WHERE name = 'Contabilidad';
  SELECT id INTO marketing_dept_id FROM public.departments WHERE name = 'Marketing';
  SELECT id INTO gerencia_dept_id FROM public.departments WHERE name = 'Gerencia';
  SELECT id INTO rrhh_dept_id FROM public.departments WHERE name = 'Recursos Humanos';
  SELECT id INTO logistica_dept_id FROM public.departments WHERE name = 'Logística';
  SELECT id INTO ti_dept_id FROM public.departments WHERE name = 'Tecnología de la Información';
  SELECT id INTO ventas_dept_id FROM public.departments WHERE name = 'Ventas';
  
  -- Obtener IDs de usuarios
  SELECT id INTO admin_user_id FROM public.profiles WHERE email = 'admin@empresa.com';
  SELECT id INTO tecnico_user_id FROM public.profiles WHERE role_name = 'technician' LIMIT 1;
  SELECT id INTO solicitante_user_id FROM public.profiles WHERE role_name = 'requester' LIMIT 1;
  
  -- Si no hay técnico, usar admin
  IF tecnico_user_id IS NULL THEN
    tecnico_user_id := admin_user_id;
  END IF;
  
  -- Si no hay solicitante, usar admin
  IF solicitante_user_id IS NULL THEN
    solicitante_user_id := admin_user_id;
  END IF;

  -- Insertar requerimientos de ejemplo
  INSERT INTO public.requirements (
    title,
    description,
    type,
    priority,
    status,
    requesting_area_id,
    assigned_to,
    created_by,
    delivered_at,
    created_at
  ) VALUES
  -- 1. Solicitud de nueva impresora para contabilidad
  (
    'Solicitud de nueva impresora para contabilidad',
    'Se requiere una impresora láser para el departamento de contabilidad. Necesitamos una HP LaserJet Pro M404n con capacidad de impresión a doble cara y red inalámbrica.',
    'equipment',
    'medium',
    'pending',
    contabilidad_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-07-28 10:30:00'
  ),
  
  -- 2. Instalación de software de diseño
  (
    'Instalación de software de diseño',
    'Se necesita instalar Adobe Creative Suite en la computadora de Ana Martínez (Marketing). Incluye Photoshop, Illustrator, InDesign y Premiere Pro.',
    'service',
    'high',
    'in_progress',
    marketing_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-07-24 14:15:00'
  ),
  
  -- 3. Solicitud de nuevo equipo para Gerencia
  (
    'Solicitud de nuevo equipo para Gerencia',
    'Solicitud de servicio requerida por Gerencia. Incluye laptop Dell XPS 15, monitor externo de 27", teclado inalámbrico y mouse ergonómico.',
    'equipment',
    'high',
    'delivered',
    gerencia_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-27 16:45:00',
    '2025-07-07 09:00:00'
  ),
  
  -- 4. Solicitud de nuevo equipo para Contabilidad
  (
    'Solicitud de nuevo equipo para Contabilidad',
    'Solicitud de servicio requerida por Contabilidad. Incluye computadora de escritorio con software de contabilidad y escáner de documentos.',
    'service',
    'low',
    'delivered',
    contabilidad_dept_id,
    NULL,
    solicitante_user_id,
    '2025-07-04 12:30:00',
    '2025-07-01 11:20:00'
  ),
  
  -- 5. Mantenimiento preventivo de equipos
  (
    'Mantenimiento preventivo de equipos',
    'Solicitud de servicio requerida por RRHH. Incluye especificaciones para mantenimiento preventivo de todas las computadoras del departamento.',
    'equipment',
    'medium',
    'delivered',
    rrhh_dept_id,
    NULL,
    solicitante_user_id,
    '2025-06-24 15:20:00',
    '2025-06-24 08:45:00'
  ),
  
  -- 6. Configuración de accesos para nuevo empleado
  (
    'Configuración de accesos para nuevo empleado',
    'Solicitud de servicio requerida por RRHH. Incluye especificaciones para crear cuentas de usuario, configurar email y asignar permisos.',
    'document',
    'low',
    'delivered',
    rrhh_dept_id,
    NULL,
    solicitante_user_id,
    '2025-07-03 10:15:00',
    '2025-06-18 14:30:00'
  ),
  
  -- 7. Creación de usuario en sistema
  (
    'Creación de usuario en sistema',
    'Solicitud de servicio requerida por Logística. Incluye creación de usuario en sistema de inventario con permisos específicos.',
    'equipment',
    'high',
    'delivered',
    logistica_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-06-29 11:45:00',
    '2025-06-17 09:20:00'
  ),
  
  -- 8. Creación de usuario en sistema
  (
    'Creación de usuario en sistema',
    'Solicitud de servicio requerida por Logística. Incluye configuración de acceso a base de datos y sistemas internos.',
    'service',
    'low',
    'delivered',
    logistica_dept_id,
    NULL,
    solicitante_user_id,
    '2025-06-13 16:30:00',
    '2025-06-13 10:00:00'
  ),
  
  -- 9. Backup de información
  (
    'Backup de información',
    'Solicitud de servicio requerida por TI. Incluye especificaciones para realizar backup completo de servidores críticos.',
    'other',
    'medium',
    'pending',
    ti_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-06-07 13:45:00'
  ),
  
  -- 10. Configuración de accesos para nuevo empleado
  (
    'Configuración de accesos para nuevo empleado',
    'Solicitud de servicio requerida por Logística. Incluye configuración de VPN, acceso remoto y permisos de red.',
    'other',
    'low',
    'in_progress',
    logistica_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-05-29 15:20:00'
  ),
  
  -- 11. Creación de usuario en sistema
  (
    'Creación de usuario en sistema',
    'Solicitud de servicio requerida por Ventas. Incluye especificaciones para crear cuenta en CRM y configurar dashboard personalizado.',
    'equipment',
    'low',
    'closed',
    ventas_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-05-26 12:00:00',
    '2025-05-26 08:30:00'
  ),
  
  -- 12. Creación de usuario en sistema
  (
    'Creación de usuario en sistema',
    'Solicitud de servicio requerida por Ventas. Incluye especificaciones para acceso a sistemas de facturación y reportes.',
    'other',
    'medium',
    'closed',
    ventas_dept_id,
    NULL,
    solicitante_user_id,
    '2025-06-04 14:15:00',
    '2025-05-17 11:45:00'
  ),
  
  -- 13. Configuración de accesos para nuevo empleado
  (
    'Configuración de accesos para nuevo empleado',
    'Solicitud de servicio requerida por Gerencia. Incluye configuración de permisos administrativos y acceso a sistemas críticos.',
    'service',
    'high',
    'delivered',
    gerencia_dept_id,
    NULL,
    solicitante_user_id,
    '2025-05-16 17:30:00',
    '2025-05-16 09:00:00'
  ),
  
  -- 14. Creación de usuario en sistema
  (
    'Creación de usuario en sistema',
    'Solicitud de servicio requerida por Ventas. Incluye especificaciones para acceso a portal de clientes y herramientas de ventas.',
    'document',
    'low',
    'in_progress',
    ventas_dept_id,
    NULL,
    solicitante_user_id,
    NULL,
    '2025-05-03 10:20:00'
  );

  -- Crear actividades recientes para los requerimientos
  INSERT INTO public.recent_activities (
    type,
    action,
    title,
    description,
    user_id,
    item_id
  ) VALUES
  ('requirement', 'created', 'Nuevo requerimiento de equipo', 'Solicitud de impresora para contabilidad', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Solicitud de nueva impresora para contabilidad' LIMIT 1)),
  ('requirement', 'created', 'Instalación de software solicitada', 'Adobe Creative Suite para marketing', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Instalación de software de diseño' LIMIT 1)),
  ('requirement', 'created', 'Equipo solicitado para gerencia', 'Laptop y periféricos para dirección', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Solicitud de nuevo equipo para Gerencia' LIMIT 1)),
  ('requirement', 'created', 'Servicio solicitado', 'Equipo de contabilidad con software', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Solicitud de nuevo equipo para Contabilidad' LIMIT 1)),
  ('requirement', 'created', 'Mantenimiento preventivo', 'Servicio de mantenimiento para RRHH', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Mantenimiento preventivo de equipos' LIMIT 1)),
  ('requirement', 'created', 'Configuración de accesos', 'Nuevo empleado en RRHH', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Configuración de accesos para nuevo empleado' AND requesting_area_id = rrhh_dept_id LIMIT 1)),
  ('requirement', 'created', 'Usuario en sistema', 'Creación de cuenta para logística', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Creación de usuario en sistema' AND requesting_area_id = logistica_dept_id AND created_at = '2025-06-17 09:20:00' LIMIT 1)),
  ('requirement', 'created', 'Usuario en sistema', 'Configuración de acceso para logística', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Creación de usuario en sistema' AND requesting_area_id = logistica_dept_id AND created_at = '2025-06-13 10:00:00' LIMIT 1)),
  ('requirement', 'created', 'Backup solicitado', 'Respaldo de información crítica', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Backup de información' LIMIT 1)),
  ('requirement', 'created', 'Configuración de accesos', 'Nuevo empleado en logística', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Configuración de accesos para nuevo empleado' AND requesting_area_id = logistica_dept_id AND created_at = '2025-05-29 15:20:00' LIMIT 1)),
  ('requirement', 'created', 'Usuario en sistema', 'Cuenta CRM para ventas', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Creación de usuario en sistema' AND requesting_area_id = ventas_dept_id AND created_at = '2025-05-26 08:30:00' LIMIT 1)),
  ('requirement', 'created', 'Usuario en sistema', 'Acceso a facturación para ventas', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Creación de usuario en sistema' AND requesting_area_id = ventas_dept_id AND created_at = '2025-05-17 11:45:00' LIMIT 1)),
  ('requirement', 'created', 'Configuración de accesos', 'Nuevo empleado en gerencia', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Configuración de accesos para nuevo empleado' AND requesting_area_id = gerencia_dept_id LIMIT 1)),
  ('requirement', 'created', 'Usuario en sistema', 'Portal de clientes para ventas', solicitante_user_id, (SELECT id FROM public.requirements WHERE title = 'Creación de usuario en sistema' AND requesting_area_id = ventas_dept_id AND created_at = '2025-05-03 10:20:00' LIMIT 1));

  RAISE NOTICE '✅ Datos de requerimientos insertados exitosamente';
  RAISE NOTICE '📊 Total de requerimientos: 14';
  RAISE NOTICE '📈 Actividades recientes creadas';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Error insertando datos de requerimientos: %', SQLERRM;
END $$; 