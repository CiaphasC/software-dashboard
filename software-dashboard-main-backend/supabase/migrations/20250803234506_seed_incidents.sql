/* ===============================================================
   MIGRATION: Insertar datos de incidencias de ejemplo
   fecha:   2025-08-03
   autor:   Sistema de Gestión
   =============================================================== */

-- Insertar datos de incidencias de ejemplo
DO $$
DECLARE
  -- IDs de departamentos
  ti_dept_id bigint;
  ventas_dept_id bigint;
  rrhh_dept_id bigint;
  contabilidad_dept_id bigint;
  finanzas_dept_id bigint;
  marketing_dept_id bigint;
  operaciones_dept_id bigint;
  legal_dept_id bigint;
  administracion_dept_id bigint;
  logistica_dept_id bigint;
  produccion_dept_id bigint;
  calidad_dept_id bigint;
  mantenimiento_dept_id bigint;
  seguridad_dept_id bigint;
  
  -- IDs de usuarios
  admin_user_id uuid;
  tecnico_user_id uuid;
  solicitante_user_id uuid;
BEGIN
  -- Obtener IDs de departamentos
  SELECT id INTO ti_dept_id FROM public.departments WHERE name = 'Tecnología de la Información';
  SELECT id INTO ventas_dept_id FROM public.departments WHERE name = 'Ventas';
  SELECT id INTO rrhh_dept_id FROM public.departments WHERE name = 'Recursos Humanos';
  SELECT id INTO contabilidad_dept_id FROM public.departments WHERE name = 'Contabilidad';
  SELECT id INTO finanzas_dept_id FROM public.departments WHERE name = 'Finanzas';
  SELECT id INTO marketing_dept_id FROM public.departments WHERE name = 'Marketing';
  SELECT id INTO operaciones_dept_id FROM public.departments WHERE name = 'Operaciones';
  SELECT id INTO legal_dept_id FROM public.departments WHERE name = 'Legal';
  SELECT id INTO administracion_dept_id FROM public.departments WHERE name = 'Administración';
  SELECT id INTO logistica_dept_id FROM public.departments WHERE name = 'Logística';
  SELECT id INTO produccion_dept_id FROM public.departments WHERE name = 'Producción';
  SELECT id INTO calidad_dept_id FROM public.departments WHERE name = 'Calidad';
  SELECT id INTO mantenimiento_dept_id FROM public.departments WHERE name = 'Mantenimiento';
  SELECT id INTO seguridad_dept_id FROM public.departments WHERE name = 'Seguridad';
  
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

  -- Insertar incidencias de ejemplo
  INSERT INTO public.incidents (
    title,
    description,
    type,
    priority,
    status,
    affected_area_id,
    assigned_to,
    created_by,
    resolved_at,
    created_at
  ) VALUES
  -- 1. Fallo en servidor de correo
  (
    'Fallo en servidor de correo',
    'El servidor Exchange no responde desde las 8:00 AM. Los usuarios no pueden enviar ni recibir emails. Impacto crítico en comunicaciones internas.',
    'technical',
    'high',
    'open',
    ti_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-07-29 08:15:00'
  ),
  
  -- 2. Impresora láser fuera de servicio
  (
    'Impresora láser fuera de servicio',
    'La impresora HP LaserJet Pro M404n en el área de ventas no imprime. Muestra error "Paper Jam" pero no hay papel atascado. Necesita mantenimiento.',
    'hardware',
    'medium',
    'in_progress',
    ventas_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-07-28 14:30:00'
  ),
  
  -- 3. Acceso lento a CRM
  (
    'Acceso lento a CRM',
    'El sistema Salesforce está respondiendo muy lento. Las consultas tardan más de 30 segundos. Afecta la productividad del equipo de ventas.',
    'software',
    'medium',
    'resolved',
    ventas_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-31 16:45:00',
    '2025-07-27 09:45:00'
  ),
  
  -- 4. Problema con WiFi en piso 3
  (
    'Problema con WiFi en piso 3',
    'La señal WiFi es muy débil en el piso 3, área de RRHH. Los dispositivos se desconectan constantemente. Posible problema con el punto de acceso.',
    'network',
    'medium',
    'open',
    rrhh_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-07-26 11:20:00'
  ),
  
  -- 5. Error en sistema de nómina
  (
    'Error en sistema de nómina',
    'El software de nómina no calcula correctamente las horas extras. Los empleados están reportando discrepancias en sus pagos.',
    'software',
    'high',
    'resolved',
    contabilidad_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-26 15:30:00',
    '2025-07-22 08:00:00'
  ),
  
  -- 6. Monitor roto en recepción
  (
    'Monitor roto en recepción',
    'El monitor Dell de 24" en recepción no enciende. Se escucha un zumbido al intentar encenderlo. Posible falla en la fuente de poder.',
    'hardware',
    'low',
    'resolved',
    administracion_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-18 12:00:00',
    '2025-07-18 09:30:00'
  ),
  
  -- 7. Virus detectado en PC de finanzas
  (
    'Virus detectado en PC de finanzas',
    'El antivirus detectó malware en la computadora de María González (Finanzas). El equipo está siendo escaneado. Posible infección por email phishing.',
    'other',
    'high',
    'closed',
    finanzas_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-13 17:00:00',
    '2025-07-13 14:30:00'
  ),
  
  -- 8. Problema con sitio web corporativo
  (
    'Problema con sitio web corporativo',
    'El sitio web de la empresa no carga correctamente en Chrome. Se ve distorsionado y las imágenes no aparecen. Funciona bien en Firefox.',
    'software',
    'medium',
    'resolved',
    marketing_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-21 11:15:00',
    '2025-07-13 10:00:00'
  ),
  
  -- 9. Fallo en sistema de respaldo
  (
    'Fallo en sistema de respaldo',
    'El backup automático de la base de datos no se ejecutó anoche. Error: "Disk space full". Necesita limpieza de archivos temporales.',
    'technical',
    'high',
    'resolved',
    ti_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-27 13:45:00',
    '2025-07-27 08:00:00'
  ),
  
  -- 10. Teclado defectuoso
  (
    'Teclado defectuoso',
    'El teclado inalámbrico de Juan Pérez (Operaciones) tiene teclas que no responden. Es un Logitech K780. Necesita reemplazo.',
    'hardware',
    'low',
    'resolved',
    operaciones_dept_id,
    NULL,
    solicitante_user_id,
    '2025-07-25 16:30:00',
    '2025-07-24 10:20:00'
  ),
  
  -- 11. Problema con scanner
  (
    'Problema con scanner',
    'El scanner Canon DR-G2110 en legal no reconoce documentos automáticamente. Necesita recalibración del sensor.',
    'hardware',
    'low',
    'resolved',
    legal_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-01 14:20:00',
    '2025-06-21 11:30:00'
  ),
  
  -- 12. Error en software de diseño
  (
    'Error en software de diseño',
    'Adobe Photoshop se cierra inesperadamente al abrir archivos grandes. Error: "Out of memory". Necesita optimización de RAM.',
    'software',
    'medium',
    'in_progress',
    marketing_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-06-21 09:15:00'
  ),
  
  -- 13. Problema con impresora de etiquetas
  (
    'Problema con impresora de etiquetas',
    'La impresora Zebra ZT410 en logística no imprime códigos de barras correctamente. Las etiquetas salen borrosas.',
    'hardware',
    'medium',
    'open',
    logistica_dept_id,
    NULL,
    solicitante_user_id,
    NULL,
    '2025-06-20 15:45:00'
  ),
  
  -- 14. Fallo en sistema de control de calidad
  (
    'Fallo en sistema de control de calidad',
    'El software de control de calidad no registra las mediciones automáticamente. Los datos se pierden al cerrar la aplicación.',
    'software',
    'high',
    'open',
    calidad_dept_id,
    NULL,
    solicitante_user_id,
    NULL,
    '2025-06-15 12:00:00'
  ),
  
  -- 15. Problema con cámara de seguridad
  (
    'Problema con cámara de seguridad',
    'La cámara IP en el estacionamiento no transmite video. Solo muestra pantalla negra. Posible falla en el cable de red.',
    'hardware',
    'medium',
    'resolved',
    seguridad_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-07-18 10:30:00',
    '2025-06-11 16:20:00'
  ),
  
  -- 16. Error en sistema de inventario
  (
    'Error en sistema de inventario',
    'El sistema de inventario muestra cantidades incorrectas. Los productos aparecen como "agotados" cuando hay stock disponible.',
    'software',
    'high',
    'in_progress',
    produccion_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    NULL,
    '2025-06-07 13:00:00'
  ),
  
  -- 17. Problema con aire acondicionado
  (
    'Problema con aire acondicionado',
    'El aire acondicionado en el servidor no funciona correctamente. La temperatura está subiendo. Riesgo para equipos críticos.',
    'other',
    'high',
    'closed',
    mantenimiento_dept_id,
    tecnico_user_id,
    solicitante_user_id,
    '2025-06-09 11:45:00',
    '2025-06-07 09:30:00'
  );

  -- Crear actividades recientes para las incidencias
  INSERT INTO public.recent_activities (
    type,
    action,
    title,
    description,
    user_id,
    item_id
  ) VALUES
  ('incident', 'created', 'Nueva incidencia crítica', 'Fallo en servidor de correo - Impacto en comunicaciones', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Fallo en servidor de correo' LIMIT 1)),
  ('incident', 'created', 'Problema con impresora', 'Impresora láser con error de papel atascado', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Impresora láser fuera de servicio' LIMIT 1)),
  ('incident', 'created', 'Sistema lento reportado', 'CRM respondiendo muy lento - Afecta ventas', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Acceso lento a CRM' LIMIT 1)),
  ('incident', 'created', 'Problema de conectividad', 'WiFi débil en piso 3 - RRHH afectado', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Problema con WiFi en piso 3' LIMIT 1)),
  ('incident', 'created', 'Error en sistema crítico', 'Sistema de nómina con errores de cálculo', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Error en sistema de nómina' LIMIT 1)),
  ('incident', 'created', 'Hardware defectuoso', 'Monitor de recepción no enciende', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Monitor roto en recepción' LIMIT 1)),
  ('incident', 'created', 'Amenaza de seguridad', 'Virus detectado en PC de finanzas', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Virus detectado en PC de finanzas' LIMIT 1)),
  ('incident', 'created', 'Problema de compatibilidad', 'Sitio web no funciona en Chrome', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Problema con sitio web corporativo' LIMIT 1)),
  ('incident', 'created', 'Fallo en backup', 'Sistema de respaldo con error de espacio', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Fallo en sistema de respaldo' LIMIT 1)),
  ('incident', 'created', 'Periférico defectuoso', 'Teclado inalámbrico con teclas fallidas', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Teclado defectuoso' LIMIT 1)),
  ('incident', 'created', 'Equipo de oficina', 'Scanner necesita recalibración', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Problema con scanner' LIMIT 1)),
  ('incident', 'created', 'Software con problemas', 'Photoshop se cierra inesperadamente', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Error en software de diseño' LIMIT 1)),
  ('incident', 'created', 'Equipo especializado', 'Impresora de etiquetas con problemas', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Problema con impresora de etiquetas' LIMIT 1)),
  ('incident', 'created', 'Sistema crítico fallando', 'Control de calidad no registra datos', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Fallo en sistema de control de calidad' LIMIT 1)),
  ('incident', 'created', 'Seguridad comprometida', 'Cámara de seguridad sin video', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Problema con cámara de seguridad' LIMIT 1)),
  ('incident', 'created', 'Error en inventario', 'Sistema muestra stock incorrecto', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Error en sistema de inventario' LIMIT 1)),
  ('incident', 'created', 'Problema ambiental', 'Aire acondicionado del servidor fallando', solicitante_user_id, (SELECT id FROM public.incidents WHERE title = 'Problema con aire acondicionado' LIMIT 1));

  RAISE NOTICE '✅ Datos de incidencias insertados exitosamente';
  RAISE NOTICE '📊 Total de incidencias: 17';
  RAISE NOTICE '📈 Actividades recientes creadas';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Error insertando datos de incidencias: %', SQLERRM;
END $$; 