# Documentación de Comentarios de Base de Datos

## 📋 Descripción

Se han agregado comentarios descriptivos inline con `--` a los campos de auditoría (`created_at`, `updated_at`, `last_modified_by`, `last_modified_at`) en las principales tablas del sistema para mejorar la documentación y comprensión del esquema de base de datos.

## 🎯 Campos Documentados

### 1. **Tabla: `public.incidents`**
```sql
last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
created_at                timestamptz not null default now(), -- Fecha y hora automática de creación
updated_at                timestamptz not null default now()  -- Fecha y hora automática de última actualización
```

### 2. **Tabla: `public.requirements`**
```sql
last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
created_at                timestamptz not null default now(), -- Fecha y hora automática de creación
updated_at                timestamptz not null default now()  -- Fecha y hora automática de última actualización
```

### 3. **Tabla: `public.departments`**
```sql
created_at  timestamptz not null default now(), -- Fecha y hora automática de creación
updated_at  timestamptz not null default now()  -- Fecha y hora automática de última actualización
```

### 4. **Tabla: `public.roles`**
```sql
created_at  timestamptz not null default now(), -- Fecha y hora automática de creación
updated_at  timestamptz not null default now()  -- Fecha y hora automática de última actualización
```

### 5. **Tabla: `public.profiles`**
```sql
created_at          timestamptz not null default now(), -- Fecha y hora automática de creación
updated_at          timestamptz not null default now(), -- Fecha y hora automática de última actualización
```

## 🔧 Funcionalidad de los Campos

### **Campo `created_at`:**
- **Tipo**: `timestamptz not null default now()`
- **Función**: Registra automáticamente la fecha y hora de creación
- **Comportamiento**: Se establece una sola vez al crear el registro
- **No modificable**: No se puede cambiar manualmente

### **Campo `updated_at`:**
- **Tipo**: `timestamptz not null default now()`
- **Función**: Registra automáticamente la fecha y hora de última modificación
- **Comportamiento**: Se actualiza automáticamente en cada modificación
- **Trigger**: Usa `trg_[table]_updated` para actualización automática

### **Campo `last_modified_by`:**
- **Tipo**: `uuid references public.profiles(id)`
- **Función**: Registra el usuario que realizó la última modificación manual
- **Comportamiento**: Se actualiza manualmente en cada modificación
- **Nullable**: Puede ser null si no se especifica

### **Campo `last_modified_at`:**
- **Tipo**: `timestamptz`
- **Función**: Registra la fecha y hora de la última modificación manual
- **Comportamiento**: Se actualiza manualmente en cada modificación
- **Nullable**: Puede ser null si no se especifica

## 📊 Beneficios de la Documentación

### ✅ Claridad:
- **Desarrolladores**: Entienden el propósito de cada campo
- **DBAs**: Comprenden la funcionalidad automática vs manual
- **Auditores**: Identifican campos de auditoría

### ✅ Mantenimiento:
- **Documentación**: Comentarios explican el comportamiento
- **Debugging**: Fácil identificación de campos de tiempo
- **Consultas**: Mejor comprensión al escribir queries

### ✅ Auditoría:
- **Trazabilidad**: Registro automático y manual de fechas
- **Compliance**: Cumplimiento de requisitos de auditoría
- **Historial**: Tracking de cambios en el tiempo

## 🛠️ Cómo Ver los Comentarios

### **1. Usando psql:**
```sql
-- Ver estructura de una tabla específica
\d+ public.incidents
```

### **2. Usando Supabase Dashboard:**
- Ir a **Database** → **Tables**
- Seleccionar la tabla
- Ver comentarios inline en la definición de columnas

### **3. Directamente en el archivo SQL:**
Los comentarios están visibles directamente en el archivo de migración:
```sql
last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
created_at                timestamptz not null default now(), -- Fecha y hora automática de creación
updated_at                timestamptz not null default now()  -- Fecha y hora automática de última actualización
```

## 📝 Convenciones de Nomenclatura

### **Formato de Comentarios Inline:**
```sql
column_name  data_type not null default value, -- Descripción clara y concisa
```

### **Patrón de Descripción:**
- **created_at**: "Fecha y hora automática de creación"
- **updated_at**: "Fecha y hora automática de última actualización"
- **last_modified_by**: "Usuario que realizó la última modificación"
- **last_modified_at**: "Fecha y hora de la última modificación manual"

### **Ejemplos:**
```sql
-- Para incidencias
last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
created_at                timestamptz not null default now(), -- Fecha y hora automática de creación

-- Para requerimientos  
last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
created_at                timestamptz not null default now(), -- Fecha y hora automática de creación
```

## 🔄 Triggers Relacionados

### **Triggers de Actualización:**
```sql
-- Para incidencias
create trigger trg_incidents_updated
  before update on public.incidents
  for each row execute procedure public.set_updated_at();

-- Para requerimientos
create trigger trg_requirements_updated
  before update on public.requirements
  for each row execute procedure public.set_updated_at();
```

### **Función `set_updated_at()`:**
```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

## 📋 Checklist de Implementación

### ✅ Completado:
- [x] Comentarios inline para tabla `incidents` (incluyendo `last_modified_by` y `last_modified_at`)
- [x] Comentarios inline para tabla `requirements` (incluyendo `last_modified_by` y `last_modified_at`)
- [x] Comentarios inline para tabla `departments`
- [x] Comentarios inline para tabla `roles`
- [x] Comentarios inline para tabla `profiles`

### 🔄 Pendiente (Opcional):
- [ ] Comentarios inline para tablas adicionales (`attachments`, `notifications`, etc.)
- [ ] Comentarios inline para campos de tiempo específicos (`review_started_at`, `resolved_at`)
- [ ] Documentación de triggers y funciones relacionadas

## 🎯 Resultado Final

**✅ Beneficios Logrados:**
- **Documentación clara** de campos de auditoría
- **Comprensión mejorada** del esquema de base de datos
- **Facilita mantenimiento** y debugging
- **Cumple estándares** de documentación de bases de datos

**✅ Campos Documentados:**
- **14 campos** con comentarios inline descriptivos
- **5 tablas principales** documentadas
- **Funcionalidad automática y manual** claramente explicada

**✅ Estilo de Comentarios:**
- **Comentarios inline** con `--` como en la imagen de referencia
- **Formato consistente** en todas las tablas
- **Descripción clara** y concisa

**¡Los comentarios inline ayudan a cualquier desarrollador a entender rápidamente el propósito y comportamiento de los campos de auditoría en el sistema!** 