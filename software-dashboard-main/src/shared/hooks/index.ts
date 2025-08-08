export * from './useInfiniteScroll'
export * from './usePaginatedQuery'
export * from './useDebouncedValue'

// =============================================================================
// HOOKS INDEX - Exportación centralizada de hooks
// Arquitectura de Software Profesional - Gestión de Hooks
// =============================================================================

// Hook de autenticación
export { useAuth } from './useAuth';

// Hooks de formularios reutilizables
export {
  useFormDropdowns,
  useAreasDropdown,
  useUsersDropdown,
  useTypeDropdown,
  usePriorityDropdown
} from './useFormDropdowns';

export {
  useVisualIndicators,
  useIncidentVisualIndicators,
  useRequirementVisualIndicators
} from './useVisualIndicators';

export {
  useFormValidation,
  useIncidentValidation,
  useRequirementValidation,
  useUserValidation,
  // Schemas
  incidentSchema,
  requirementSchema,
  userSchema,
  baseFormSchema,
  // Tipos
  type IncidentFormData,
  type RequirementFormData,
  type UserFormData,
  type BaseFormData
} from './useFormValidation';

export {
  useFormData,
  useAreasData,
  useUsersData,
  useFilteredUsersData,
  useIncidentsData,
  useRequirementsData,
  useIncidentFormData,
  useRequirementFormData,
  useUserFormData,
  useCachedFormData
} from './useFormData';

// Hooks específicos para formularios
export { useIncidentForm } from './useIncidentForm'; 