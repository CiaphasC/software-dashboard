-- =============================================================================
-- MIGRACIÓN: Calcular tiempo desde primer cambio de estado hasta estado final
-- Fecha: 2025-01-27
-- Descripción: Calcular tiempo desde el primer cambio de estado hasta completado/cerrado/entregado
-- =============================================================================

-- Función para calcular tiempo de resolución de incidencias desde primer cambio
CREATE OR REPLACE FUNCTION public.calculate_incident_resolution_time()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- Si es la primera vez que cambia de estado (de 'open' a otro estado)
  IF old.status = 'open' AND new.status != 'open' AND new.status != old.status THEN
    -- Registrar el primer cambio de estado
    new.review_started_at := now();
    new.response_time_hours := 0; -- Tiempo desde creación hasta primer cambio
  END IF;
  
  -- Si cambia a 'in_progress' y no tiene review_started_at
  IF new.status = 'in_progress' AND new.review_started_at IS NULL THEN
    new.review_started_at := now();
  END IF;
  
  -- Si se completa, cierra o entrega la incidencia
  IF (new.status = 'completed' OR new.status = 'closed' OR new.status = 'delivered') AND new.resolved_at IS NOT NULL AND 
     (old.resolved_at IS NULL OR new.resolved_at != old.resolved_at) THEN
    -- Calcular tiempo total desde el primer cambio hasta completado/cerrado/entregado
    IF new.review_started_at IS NOT NULL THEN
      new.resolution_time_hours := extract(epoch from (new.resolved_at - new.review_started_at)) / 3600;
    END IF;
  END IF;
  
  RETURN new;
END $$;

-- Función para calcular tiempo de entrega de requerimientos desde primer cambio
CREATE OR REPLACE FUNCTION public.calculate_requirement_delivery_time()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- Si es la primera vez que cambia de estado (de 'open' a otro estado)
  IF old.status = 'open' AND new.status != 'open' AND new.status != old.status THEN
    -- Registrar el primer cambio de estado
    new.review_started_at := now();
    new.response_time_hours := 0; -- Tiempo desde creación hasta primer cambio
  END IF;
  
  -- Si cambia a 'in_progress' y no tiene review_started_at
  IF new.status = 'in_progress' AND new.review_started_at IS NULL THEN
    new.review_started_at := now();
  END IF;
  
  -- Si se entrega, cierra o completa el requerimiento
  IF (new.status = 'delivered' OR new.status = 'closed' OR new.status = 'completed') AND new.delivered_at IS NOT NULL AND 
     (old.delivered_at IS NULL OR new.delivered_at != old.delivered_at) THEN
    -- Calcular tiempo total desde el primer cambio hasta entregado/cerrado/completado
    IF new.review_started_at IS NOT NULL THEN
      new.delivery_time_hours := extract(epoch from (new.delivered_at - new.review_started_at)) / 3600;
    END IF;
  END IF;
  
  RETURN new;
END $$;

-- Comentarios explicativos
COMMENT ON FUNCTION public.calculate_incident_resolution_time() IS 
'Calcula tiempo de resolución desde el primer cambio de estado hasta completado/cerrado/entregado.
Registra review_started_at en el primer cambio de estado y calcula tiempo total hasta completed/closed/delivered.';

COMMENT ON FUNCTION public.calculate_requirement_delivery_time() IS 
'Calcula tiempo de entrega desde el primer cambio de estado hasta entregado/cerrado/completado.
Registra review_started_at en el primer cambio de estado y calcula tiempo total hasta delivered/closed/completed.'; 