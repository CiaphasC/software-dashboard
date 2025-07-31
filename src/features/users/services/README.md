# Servicio Reactivo de Usuarios

## Descripción

El servicio `usersApi` proporciona una capa de abstracción reactiva para la gestión de usuarios, utilizando RxJS para manejar el estado global y las actualizaciones en tiempo real.

## Características

### 🔄 **Reactividad Completa**
- **BehaviorSubject**: Estado global reactivo para usuarios, loading y errores
- **Observables**: Streams de datos que se actualizan automáticamente
- **Operadores RxJS**: Transformación y filtrado de datos reactivo

### 🎯 **Funcionalidades**

#### **Gestión de Estado**
- `users$`: Observable de la lista de usuarios
- `loading$`: Observable del estado de carga
- `error$`: Observable de errores

#### **Operaciones CRUD**
- `fetchUsers()`: Cargar usuarios desde la API
- `createUser(userData)`: Crear nuevo usuario
- `updateUser(id, userData)`: Actualizar usuario existente
- `deleteUser(id)`: Eliminar usuario
- `refreshUsers()`: Recargar datos

#### **Filtrado Reactivo**
- `getFilteredUsers(filters)`: Filtrar usuarios por rol, departamento y búsqueda
- Actualización automática cuando cambian los filtros

#### **Estadísticas Reactivas**
- `getUsersStats()`: Estadísticas calculadas automáticamente
- Actualización en tiempo real cuando cambian los datos

## Uso

### En Componentes React

```typescript
import { usersApi } from '../services/usersApi';
import { useObservable } from '@/shared/reactive/hooks/useReactiveState';

const MyComponent = () => {
  const users = useObservable(usersApi.users$, []);
  const loading = useObservable(usersApi.loading$, false);
  const stats = useObservable(usersApi.getUsersStats(), defaultStats);

  // Los datos se actualizan automáticamente
  return (
    <div>
      {loading ? 'Cargando...' : `${users.length} usuarios`}
    </div>
  );
};
```

### En Hooks Personalizados

```typescript
import { usersApi } from '../services/usersApi';

export const useUsers = () => {
  const users = useObservable(usersApi.users$, []);
  const loading = useObservable(usersApi.loading$, false);
  const error = useObservable(usersApi.error$, null);

  const createUser = async (userData) => {
    await usersApi.createUser(userData).toPromise();
  };

  return { users, loading, error, createUser };
};
```

## Ventajas

### 🚀 **Performance**
- **Actualizaciones automáticas**: No necesitas manualmente actualizar el estado
- **Optimización de re-renders**: Solo se actualizan los componentes que usan los datos
- **Caching inteligente**: Los datos se mantienen en memoria

### 🎯 **Simplicidad**
- **Menos código boilerplate**: No necesitas manejar estado local
- **Sincronización automática**: Todos los componentes ven los mismos datos
- **Manejo de errores centralizado**: Errores manejados en un solo lugar

### 🔄 **Reactividad**
- **Tiempo real**: Los cambios se propagan instantáneamente
- **Filtrado dinámico**: Los filtros se aplican automáticamente
- **Estadísticas actualizadas**: Las métricas se recalculan automáticamente

## Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Externa   │───▶│   usersApi       │───▶│   Componentes   │
│                 │    │   (RxJS)         │    │   React         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Observables    │
                       │   (Estado)       │
                       └──────────────────┘
```

## Configuración

El servicio está configurado como un singleton, por lo que todos los componentes comparten la misma instancia:

```typescript
// Instancia global
export const usersApi = new UsersService();
```

## Manejo de Errores

Los errores se manejan automáticamente en el servicio:

- **Toast notifications**: Errores mostrados al usuario
- **Estado de error**: Observable `error$` para manejo en componentes
- **Recuperación automática**: Los observables continúan funcionando después de errores

## Próximas Mejoras

- [ ] Integración con WebSockets para actualizaciones en tiempo real
- [ ] Cache persistente con localStorage
- [ ] Optimistic updates para mejor UX
- [ ] Debounce en filtros de búsqueda
- [ ] Paginación reactiva 