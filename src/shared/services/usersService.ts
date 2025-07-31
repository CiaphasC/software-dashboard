/**
 * SERVICIO REACTIVO CENTRALIZADO DE USUARIOS
 * ==========================================
 * 
 * Este servicio implementa una arquitectura reactiva profesional para la gestión
 * de usuarios, centralizando toda la lógica de estado y conectividad con APIs.
 * 
 * ARQUITECTURA:
 * - Singleton pattern para estado global
 * - BehaviorSubject para estado reactivo
 * - Memoización de observables para performance
 * - Manejo centralizado de errores y loading
 * - Integración con APIs externas
 */

import { BehaviorSubject, Observable, of, throwError, combineLatest } from 'rxjs';
import { 
  map, 
  catchError, 
  switchMap, 
  distinctUntilChanged,
  shareReplay
} from 'rxjs/operators';
import { User, UserRole } from '@/shared/types/common.types';
import { authApi } from './api/auth/authApi';
import toast from 'react-hot-toast';

// Interfaces para tipado fuerte
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

interface UsersFilters {
  role?: UserRole;
  department?: string;
  search?: string;
}

interface UsersStats {
  total: number;
  admin: number;
  technician: number;
  requester: number;
  active: number;
  departments: number;
}

/**
 * CLASE PRINCIPAL DEL SERVICIO DE USUARIOS
 * 
 * Implementa el patrón Singleton con estado reactivo optimizado
 * y memoización de observables para evitar bucles infinitos.
 */
class UsersService {
  // Estado reactivo privado
  private readonly stateSubject = new BehaviorSubject<UsersState>({
    users: [],
    loading: false,
    error: null
  });

  // Filtros reactivos
  private readonly filtersSubject = new BehaviorSubject<UsersFilters>({});

  // Observables públicos memoizados
  public readonly state$ = this.stateSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

    public readonly users$ = this.state$.pipe(
      map((state: UsersState) => state.users),
    distinctUntilChanged(),
    shareReplay(1)
  );

    public readonly loading$ = this.state$.pipe(
      map((state: UsersState) => state.loading),
    distinctUntilChanged(),
    shareReplay(1)
  );

    public readonly error$ = this.state$.pipe(
      map((state: UsersState) => state.error),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly filters$ = this.filtersSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Observable de usuarios filtrados memoizado
  public readonly filteredUsers$ = combineLatest([
    this.users$,
    this.filters$
  ]).pipe(
    map(([users, filters]) => this.applyFilters(users, filters)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Observable de estadísticas memoizado
  public readonly stats$ = this.users$.pipe(
    map(users => this.calculateStats(users)),
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Getters para acceso síncrono
  public get users(): User[] {
    return this.stateSubject.value.users;
  }

  public get loading(): boolean {
    return this.stateSubject.value.loading;
  }

  public get error(): string | null {
    return this.stateSubject.value.error;
  }

  public get filters(): UsersFilters {
    return this.filtersSubject.value;
  }

  /**
   * MÉTODOS PRIVADOS PARA GESTIÓN DE ESTADO
   */

  private setState(updates: Partial<UsersState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...updates
    });
  }

  private setFilters(filters: UsersFilters): void {
    this.filtersSubject.next(filters);
  }

  private setError(error: string | null): void {
    this.setState({ error });
  }

  private setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * APLICACIÓN DE FILTROS
   * 
   * Método optimizado para aplicar filtros sin recrear observables
   */
  private applyFilters(users: User[], filters: UsersFilters): User[] {
    return users.filter(user => {
      // Filtro por rol
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Filtro por departamento
      if (filters.department && user.department !== filters.department) {
        return false;
      }

      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(searchLower);
        const matchesEmail = user.email.toLowerCase().includes(searchLower);
        const matchesDepartment = user.department.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesEmail && !matchesDepartment) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * CÁLCULO DE ESTADÍSTICAS
   * 
   * Método optimizado para calcular estadísticas sin recrear observables
   */
  private calculateStats(users: User[]): UsersStats {
    const active = users.filter(u => {
      const lastActivity = new Date(u.updatedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActivity > thirtyDaysAgo;
    }).length;

    return {
      total: users.length,
      admin: users.filter(u => u.role === UserRole.ADMIN).length,
      technician: users.filter(u => u.role === UserRole.TECHNICIAN).length,
      requester: users.filter(u => u.role === UserRole.REQUESTER).length,
      active,
      departments: new Set(users.map(u => u.department)).size,
    };
  }

  /**
   * MÉTODOS PÚBLICOS PARA OPERACIONES CRUD
   */

  /**
   * CARGAR USUARIOS DESDE LA API
   * 
   * Conecta con la API externa y actualiza el estado reactivo
   */
  public fetchUsers(): Observable<User[]> {
    this.setLoading(true);
    this.setError(null);

    return of(null).pipe(
      switchMap(async () => {
        try {
          // CONECTIVIDAD CON API: Inicializar datos si es necesario
          if (typeof authApi.initializeUsers === 'function') {
            authApi.initializeUsers();
          }
          
          // CONECTIVIDAD CON API: Llamada real a la API
          const data = await authApi.getUsers();
          
          // ACTUALIZACIÓN REACTIVA: Propagar datos a todos los componentes
          this.setState({ users: data });
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar usuarios';
          this.setError(errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          this.setLoading(false);
        }
      }),
      catchError((error) => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * CREAR NUEVO USUARIO
   * 
   * Conecta con la API y actualiza el estado reactivo
   */
  public createUser(userData: Partial<User>): Observable<User> {
    this.setLoading(true);
    this.setError(null);

    return of(null).pipe(
      switchMap(async () => {
        try {
          // PREPARACIÓN DE DATOS
          const newUser: User = {
            id: Date.now().toString(),
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || UserRole.REQUESTER,
            department: userData.department || '',
            avatar: userData.avatar,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // CONECTIVIDAD CON API: En una app real, esto sería una llamada HTTP
          // const createdUser = await authApi.createUser(newUser);
          
          // ACTUALIZACIÓN REACTIVA: Agregar a estado local inmediatamente
          const currentUsers = this.users;
          const updatedUsers = [...currentUsers, newUser];
          this.setState({ users: updatedUsers });
          
          toast.success('Usuario creado exitosamente');
          return newUser;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
          this.setError(errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          this.setLoading(false);
        }
      }),
      catchError((error) => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ACTUALIZAR USUARIO EXISTENTE
   * 
   * Conecta con la API y actualiza el estado reactivo
   */
  public updateUser(id: string, userData: Partial<User>): Observable<User> {
    this.setLoading(true);
    this.setError(null);

    return of(null).pipe(
      switchMap(async () => {
        try {
          // CONECTIVIDAD CON API: En una app real, esto sería una llamada HTTP
          // const updatedUser = await authApi.updateUser(id, userData);
          
          // ACTUALIZACIÓN REACTIVA: Modificar estado local
          const currentUsers = this.users;
          const updatedUsers = currentUsers.map(user => 
            user.id === id 
              ? { ...user, ...userData, updatedAt: new Date() }
              : user
          );
          
          const updatedUser = updatedUsers.find(user => user.id === id);
          if (!updatedUser) {
            throw new Error('Usuario no encontrado');
          }
          
          this.setState({ users: updatedUsers });
          toast.success('Usuario actualizado exitosamente');
          return updatedUser;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al actualizar usuario';
          this.setError(errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          this.setLoading(false);
        }
      }),
      catchError((error) => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ELIMINAR USUARIO
   * 
   * Conecta con la API y actualiza el estado reactivo
   */
  public deleteUser(id: string): Observable<void> {
    this.setLoading(true);
    this.setError(null);

    return of(null).pipe(
      switchMap(async () => {
        try {
          // CONECTIVIDAD CON API: En una app real, esto sería una llamada HTTP
          // await authApi.deleteUser(id);
          
          // ACTUALIZACIÓN REACTIVA: Remover del estado local
          const currentUsers = this.users;
          const updatedUsers = currentUsers.filter(user => user.id !== id);
          this.setState({ users: updatedUsers });
          
          toast.success('Usuario eliminado exitosamente');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al eliminar usuario';
          this.setError(errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          this.setLoading(false);
        }
      }),
      catchError((error) => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * RECARGAR DATOS DESDE LA API
   * 
   * Fuerza una recarga completa de datos desde el servidor
   */
  public refreshUsers(): Observable<User[]> {
    return this.fetchUsers();
  }

  /**
   * MÉTODOS PARA GESTIÓN DE FILTROS
   */

  /**
   * ACTUALIZAR FILTROS
   * 
   * Actualiza los filtros de forma reactiva
   */
  public updateFilters(filters: Partial<UsersFilters>): void {
    this.setFilters({
      ...this.filtersSubject.value,
      ...filters
    });
  }

  /**
   * LIMPIAR FILTROS
   * 
   * Resetea todos los filtros
   */
  public clearFilters(): void {
    this.setFilters({});
  }

  /**
   * MÉTODOS DE UTILIDAD
   */

  /**
   * LIMPIAR ERRORES
   * 
   * Permite limpiar manualmente el estado de error
   */
  public clearError(): void {
    this.setError(null);
  }

  /**
   * RESETEAR ESTADO COMPLETO
   * 
   * Útil para limpiar el estado cuando el usuario cierra sesión
   */
  public reset(): void {
    this.setState({
      users: [],
      loading: false,
      error: null
    });
    this.setFilters({});
  }
}

/**
 * INSTANCIA SINGLETON DEL SERVICIO
 * 
 * Esta instancia única asegura que toda la aplicación use el mismo
 * estado de usuarios, manteniendo la sincronización global.
 */
export const usersService = new UsersService();

// Exportar tipos para uso externo
export type { UsersState, UsersFilters, UsersStats }; 