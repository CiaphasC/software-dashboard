# Hooks Reutilizables - Documentación

## 📋 Descripción General

Este directorio contiene hooks reutilizables que permiten compartir lógica común entre diferentes componentes de formularios, mejorando la mantenibilidad y reduciendo la duplicación de código.

## 🎯 Hooks Disponibles

### 1. `useFormDropdowns` - Dropdowns Personalizados

Hook base para crear dropdowns personalizados con funcionalidad completa.

```typescript
import { useFormDropdowns } from '@/shared/hooks';

const MyDropdown = () => {
  const dropdown = useFormDropdowns({
    options: [
      { id: '1', label: 'Opción 1', value: 'option1' },
      { id: '2', label: 'Opción 2', value: 'option2' }
    ],
    initialValue: '',
    onSelect: (value) => console.log('Seleccionado:', value),
    placeholder: 'Selecciona una opción'
  });

  return (
    <div className="dropdown-container">
      <button onClick={() => dropdown.setIsOpen(!dropdown.isOpen)}>
        {dropdown.selectedLabel || dropdown.placeholder}
      </button>
      {/* Dropdown options */}
    </div>
  );
};
```

#### Hooks Específicos de Dropdowns:

- **`useAreasDropdown`** - Para selección de áreas/departamentos
- **`useUsersDropdown`** - Para selección de usuarios
- **`useTypeDropdown`** - Para selección de tipos
- **`usePriorityDropdown`** - Para selección de prioridades

### 2. `useVisualIndicators` - Indicadores Visuales

Hook para manejar indicadores visuales de prioridad y tipo.

```typescript
import { useIncidentVisualIndicators } from '@/shared/hooks';

const VisualIndicators = ({ priority, type }) => {
  const indicators = useIncidentVisualIndicators({ priority, type });

  return (
    <div className="flex gap-2">
      <div className={indicators.priority.color}>
        {indicators.priority.icon}
        <span>{indicators.priority.label}</span>
      </div>
      <div>
        {indicators.type.icon}
        <span>{indicators.type.label}</span>
      </div>
    </div>
  );
};
```

### 3. `useFormValidation` - Validación de Formularios

Hook para manejar validaciones con Zod schemas.

```typescript
import { useIncidentValidation, incidentSchema } from '@/shared/hooks';

const MyForm = () => {
  const validation = useIncidentValidation(formData);
  
  const handleSubmit = () => {
    const result = validation.validate();
    if (result.success) {
      // Datos válidos
    } else {
      // Mostrar errores: result.errors
    }
  };
};
```

#### Schemas Disponibles:

- **`incidentSchema`** - Para formularios de incidencias
- **`requirementSchema`** - Para formularios de requerimientos
- **`userSchema`** - Para formularios de usuarios

### 4. `useFormData` - Carga de Datos

Hook para cargar datos de formularios desde servicios.

```typescript
import { useIncidentFormData } from '@/shared/hooks';

const IncidentForm = () => {
  const { areas, users, loading, error } = useIncidentFormData(userRole);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <form>
      {/* Usar areas y users */}
    </form>
  );
};
```

#### Hooks de Datos Disponibles:

- **`useAreasData`** - Cargar áreas/departamentos
- **`useUsersData`** - Cargar todos los usuarios
- **`useFilteredUsersData`** - Cargar usuarios filtrados por rol (backend)
- **`useIncidentFormData`** - Combinación para formulario de incidencias
- **`useRequirementFormData`** - Combinación para formulario de requerimientos

#### 🔒 Filtrado de Usuarios por Rol (Backend):

El edge function `get-users` implementa filtrado de seguridad:

- **Administradores**: Ven todos los usuarios activos
- **Técnicos**: Ven SOLO su propio usuario
- **Requesters**: Ven administradores y técnicos

#### 📋 Ejemplo Práctico del Filtrado:

```typescript
// Cuando un ADMIN hace la petición:
const adminUsers = await edgeFunctionsService.getUsers();
// Resultado: [usuario1, usuario2, usuario3, ...] (todos los usuarios)

// Cuando un TÉCNICO hace la petición:
const technicianUsers = await edgeFunctionsService.getUsers();
// Resultado: [usuario_actual] (solo su propio usuario)

// Cuando un REQUESTER hace la petición:
const requesterUsers = await edgeFunctionsService.getUsers();
// Resultado: [admin1, admin2, technician1, technician2, ...]
```

**Beneficios de Seguridad:**
- ✅ Los técnicos no pueden ver información de otros usuarios
- ✅ El filtrado se hace en el backend (más seguro)
- ✅ Los administradores mantienen control total
- ✅ Los requesters pueden asignar a personal autorizado

### 5. `useIncidentForm` - Hook Completo para Incidencias

Hook que combina todos los hooks anteriores para el formulario de incidencias.

```typescript
import { useIncidentForm } from '@/shared/hooks';

const IncidentForm = ({ initialData, isEdit, onSuccess }) => {
  const {
    form,
    isSubmitting,
    areasDropdown,
    usersDropdown,
    typeDropdown,
    priorityDropdown,
    visualIndicators,
    handleSubmit
  } = useIncidentForm({
    initialData,
    isEdit,
    onSuccess
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Campos del formulario usando los dropdowns */}
      {/* Indicadores visuales */}
    </form>
  );
};
```

## 🔧 Beneficios de la Reutilización

### ✅ Ventajas:

1. **Reducción de Código Duplicado**: Lógica común centralizada
2. **Consistencia**: Comportamiento uniforme en toda la aplicación
3. **Mantenibilidad**: Cambios en un solo lugar
4. **Testabilidad**: Hooks aislados más fáciles de probar
5. **Reutilización**: Fácil implementación en nuevos formularios

### 📊 Métricas de Mejora:

- **Antes**: ~500 líneas duplicadas entre formularios
- **Después**: ~200 líneas reutilizables
- **Reducción**: ~60% menos código duplicado

## 🚀 Ejemplo de Implementación

### Antes (Código Duplicado):

```typescript
// IncidentForm.tsx - 300+ líneas
const IncidentForm = () => {
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  
  // Lógica duplicada para dropdowns
  // Lógica duplicada para validación
  // Lógica duplicada para indicadores visuales
};

// RequirementForm.tsx - 300+ líneas similares
const RequirementForm = () => {
  // Misma lógica duplicada
};
```

### Después (Código Reutilizable):

```typescript
// IncidentForm.tsx - 50 líneas
const IncidentForm = () => {
  const form = useIncidentForm({ onSuccess: handleSuccess });
  
  return (
    <form onSubmit={form.form.handleSubmit(form.handleSubmit)}>
      {/* UI simplificada usando hooks */}
    </form>
  );
};

// RequirementForm.tsx - 50 líneas similares
const RequirementForm = () => {
  const form = useRequirementForm({ onSuccess: handleSuccess });
  // Misma estructura simplificada
};
```

## 📝 Convenciones de Uso

### Nomenclatura:
- Hooks base: `use[Funcionalidad]`
- Hooks específicos: `use[Entidad][Funcionalidad]`
- Schemas: `[entidad]Schema`

### Estructura de Archivos:
```
hooks/
├── useFormDropdowns.ts      # Dropdowns base
├── useVisualIndicators.ts   # Indicadores visuales
├── useFormValidation.ts     # Validaciones
├── useFormData.ts          # Carga de datos
├── useIncidentForm.ts      # Hook específico
└── index.ts               # Exportaciones
```

## 🔄 Migración de Formularios Existentes

Para migrar formularios existentes a estos hooks:

1. **Identificar lógica duplicada**
2. **Extraer a hooks reutilizables**
3. **Refactorizar componentes**
4. **Actualizar imports**
5. **Probar funcionalidad**

## 🧪 Testing

Los hooks están diseñados para ser fácilmente testables:

```typescript
import { renderHook } from '@testing-library/react';
import { useFormDropdowns } from '@/shared/hooks';

test('useFormDropdowns should work correctly', () => {
  const { result } = renderHook(() => 
    useFormDropdowns({
      options: [{ id: '1', label: 'Test', value: 'test' }]
    })
  );

  expect(result.current.selectedValue).toBe('');
  expect(result.current.isOpen).toBe(false);
});
``` 