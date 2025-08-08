# Sistema de Cálculo de Tiempos - Desde Primer Cambio de Estado

## 📋 Descripción General

El sistema ahora calcula los tiempos de resolución/entrega **desde el primer cambio de estado** hasta el estado final (completado/cerrado/entregado), en lugar de desde la fecha de creación.

## ⏱️ Cómo Funciona

### Para Incidencias (`incidents`)

1. **Estado Inicial**: `open`
2. **Primer Cambio**: Cuando cambia de `open` a cualquier otro estado
   - Se registra `review_started_at = now()`
   - Se establece `response_time_hours = 0`
3. **Estado Final**: `completed` o `closed`
   - Si `completed` o `closed`: Calcula tiempo desde `review_started_at` hasta `resolved_at`

### Para Requerimientos (`requirements`)

1. **Estado Inicial**: `open`
2. **Primer Cambio**: Cuando cambia de `open` a cualquier otro estado
   - Se registra `review_started_at = now()`
   - Se establece `response_time_hours = 0`
3. **Estado Final**: `delivered` o `closed`
   - Si `delivered` o `closed`: Calcula tiempo desde `review_started_at` hasta `delivered_at`

## 🔄 Flujo de Estados

### Incidencias
```
open → [primer cambio] → in_progress → completed/closed
     ↑
review_started_at se registra aquí
```

### Requerimientos
```
open → [primer cambio] → in_progress → delivered/closed
     ↑
review_started_at se registra aquí
```

## 📊 Campos de Tiempo

### Incidencias
- `review_started_at`: Momento del primer cambio de estado
- `resolved_at`: Momento de completado/cerrado (cuando status = 'completed' o 'closed')
- `resolution_time_hours`: Tiempo desde primer cambio hasta completado/cerrado

### Requerimientos
- `review_started_at`: Momento del primer cambio de estado
- `delivered_at`: Momento de entrega/cierre (cuando status = 'delivered' o 'closed')
- `delivery_time_hours`: Tiempo desde primer cambio hasta entregado/cerrado

## 🎯 Ventajas del Nuevo Sistema

1. **Precisión**: Mide el tiempo real de trabajo, no el tiempo total desde creación
2. **Justicia**: No penaliza por tiempo de espera inicial
3. **Análisis**: Permite identificar cuándo realmente se inició el trabajo
4. **Flexibilidad**: Calcula tiempo tanto para completado como para cerrado

## ⚙️ Funciones de Triggers

### `calculate_incident_resolution_time()`
- Se ejecuta automáticamente al cambiar el estado de una incidencia
- Registra el primer cambio en `review_started_at`
- Calcula tiempo total hasta completado o cerrado

### `calculate_requirement_delivery_time()`
- Se ejecuta automáticamente al cambiar el estado de un requerimiento
- Registra el primer cambio en `review_started_at`
- Calcula tiempo total hasta entregado o cerrado

## 📈 Ejemplo Práctico

### Escenario: Incidencia
1. **Creada**: 2025-01-27 09:00:00 (status: 'open')
2. **Primer cambio**: 2025-01-27 14:30:00 (status: 'in_progress')
   - `review_started_at` = 2025-01-27 14:30:00
3. **Completada**: 2025-01-28 11:00:00 (status: 'completed')
   - `resolved_at` = 2025-01-28 11:00:00
   - `resolution_time_hours` = 20.5 horas (desde 14:30 hasta 11:00 del día siguiente)

### Resultado
- **Tiempo total desde creación**: 26 horas
- **Tiempo real de trabajo**: 20.5 horas
- **Tiempo de espera inicial**: 5.5 horas

## 🔧 Configuración

Las funciones están configuradas en la migración:
`20250803234509_adjust_resolution_time_calculation.sql`

Los triggers se aplican automáticamente a las tablas:
- `incidents` → `calculate_incident_resolution_time()`
- `requirements` → `calculate_requirement_delivery_time()` 