// =============================================================================
// STORE INDEX - Índice principal del store centralizado
// Arquitectura de Software Profesional - Gestión de Estado Unificada
// =============================================================================

// =============================================================================
// STORE EXPORTS - Exportaciones de stores
// =============================================================================

export { useAuthStore } from './authStore';
export { useUsersStore } from './usersStore';
export { useIncidentsStore } from './incidentsStore';
export { useRequirementsStore } from './requirementsStore';
export { useSettingsStore } from './settingsStore';

// =============================================================================
// STORE TYPES - Tipos del store
// =============================================================================

export type { AuthState, AuthActions } from './authStore';
export type { UsersState, UsersActions } from './usersStore';
export type { IncidentsState, IncidentsActions } from './incidentsStore';
export type { RequirementsState, RequirementsActions } from './requirementsStore';
export type { SettingsState, SettingsActions } from './settingsStore';

// =============================================================================
// STORE PROVIDER - Provider del store
// =============================================================================

export { StoreProvider } from './StoreProvider';

// =============================================================================
// STORE SELECTORS - Selectores optimizados (FASE 2)
// =============================================================================

export * from './selectors'; 